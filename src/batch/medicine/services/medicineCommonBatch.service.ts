import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma, medicine, pharmacologicalClass } from '@prisma/client';
import { UtilProvider } from '@src/batch/util.provider';
import { S3Service } from '@src/common/aws/s3/s3.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { COMMON_API_URL_BUILD } from '@src/constant';
import { Medicine } from '@src/type/medicine';
import {
  bufferCount,
  catchError,
  concatMap,
  from,
  map,
  mergeMap,
  of,
  retry,
} from 'rxjs';

@Injectable()
export class MedicineCommonBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly util: UtilProvider,
  ) {}

  // ---------------------------------
  // BATCH
  // ---------------------------------
  batch(sort: 'ASC' | 'DESC' = 'ASC') {
    return this.util
      .fetchOpenApiPages$<Medicine.Common.OpenApiDto>(
        COMMON_API_URL_BUILD,
        100,
        1,
        sort,
      )
      .pipe(
        map((openApi) =>
          this.util.convertOpenApiToDto<
            Medicine.Common.OpenApiDto,
            Medicine.Common.Dto
          >(openApi, Medicine.Common.OPEN_API_DTO_KEY_MAP),
        ),
        bufferCount(100),
        concatMap((common) => this.bulkCheckExistMedicine(common)),
        mergeMap((c) => c),
        map((c) => this.checkImageUpdated$(c)),
        mergeMap(({ common, updated }) =>
          updated ? this.uploadAndSetUpdatedImage$(common) : of(common),
        ),
        map((common) => this.pickMedicineCommonData(common)),
        bufferCount(100),
        mergeMap((common) => this.bulkUpdateMedicineCommon$(common)),
      );
  }

  /// ---------------------------------
  /// FETCH MEDICINE COMMON PAGE
  /// ---------------------------------
  fetchImageBuffer$(imageUrl: string) {
    return this.httpService.get(imageUrl, { responseType: 'arraybuffer' }).pipe(
      map(({ data }) => data),
      retry({ count: 3, delay: 5000 }),
    );
  }

  /// ---------------------------------
  /// DB
  /// ---------------------------------
  async bulkCheckExistMedicine(medicineCommonList: Medicine.Common.Dto[]) {
    const ids = medicineCommonList.map((medicine) => medicine.serial_number);
    const existMedicineList = await this.prisma.medicine.findMany({
      where: { id: { in: ids } },
    });
    return existMedicineList
      .map((before) => {
        const common = medicineCommonList.find(
          (common) => common.serial_number === before.id,
        );
        if (common) {
          return [{ before, common }];
        }
        return [];
      })
      .flat();
  }

  bulkUpdateMedicineCommon$(
    updateInput: (Prisma.medicineUpdateInput & { id: string })[],
  ) {
    return from(updateInput).pipe(
      mergeMap((input) => {
        const { id, pharmacological_class, company_serial_number, image_url } =
          input;
        if (!pharmacological_class && !company_serial_number && !image_url) {
          return of(null); // 아무 것도 하지 않음
        }

        const data = {
          ...(pharmacological_class ? { pharmacological_class } : {}),
          ...(company_serial_number ? { company_serial_number } : {}),
          ...(image_url ? { image_url } : {}),
        };
        return from(
          this.prisma.medicine.update({
            where: { id },
            data,
          }),
        ).pipe(
          catchError((error) => {
            console.error('Error updating medicine', error);
            return of(null); // 에러 처리
          }),
        );
      }), // 동시성 제한
      retry({ count: 3, delay: 5000 }),
      catchError((error) => {
        console.error('Error in bulk update', error);
        return of(null); // 전체 작업에 대한 에러 처리
      }),
    );
  }

  /// ---------------------------------
  checkImageUpdated$({
    before,
    common,
  }: {
    before: medicine;
    common: Medicine.Common.Dto;
  }) {
    const image = common.image;
    const beforeImage = before.image_url;
    if (!image) {
      return { common, updated: false };
    }
    const imageName = image.split('/').pop();
    if (!imageName) {
      return { common, updated: true };
    }

    const checkImageUpdated =
      !beforeImage?.includes(imageName) || beforeImage.includes('nedrug');
    if (checkImageUpdated) {
      return { common, updated: true };
    }

    return { common, updated: false };
  }

  /// ---------------------------------
  /// SET MEDICINE COMMON INFO
  /// ---------------------------------
  uploadAndSetUpdatedImage$(medicine: Medicine.Common.Dto) {
    const { image } = medicine;
    if (!image) return of(medicine);
    const imageName = image.split('/').pop();

    if (!imageName) return of(medicine);
    const imageKey = `medicines/${imageName}.jpg`;
    const new_image_url = `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${imageKey}`;
    return this.fetchImageBuffer$(image).pipe(
      map((arrayBuffer) => Buffer.from(arrayBuffer)),
      mergeMap(
        (buffer) =>
          this.s3Service.upload({
            bucket: process.env.AWS_S3_BUCKET!,
            key: imageKey,
            file: buffer,
          }),
        20,
      ),
      map(() => ({ ...medicine, image: new_image_url })),
      retry({ count: 3, delay: 5000 }),
    );
  }

  parsePharmacologicalClass(
    pharmacologicalClass?: string | null,
  ): pharmacologicalClass[] {
    // "[M082720]록시스로마이신/[M104917]록시스로마이신제피세립/[M222840]록시트로마이신/[M222994]록시트로마이신/[M243529]제피된 록시트로마이신,
    if (!pharmacologicalClass) return [];

    const _pharmacologicalClass = pharmacologicalClass.split('/');
    const regex = /\[(?<code>[A-Z0-9]+)\](?<name>.+)/;
    return _pharmacologicalClass
      .map((compound) => {
        const { code, name } = compound.match(regex)?.groups ?? {};
        return {
          code,
          name,
        };
      })
      .filter(({ code }) => code);
  }

  pickMedicineCommonData(
    medicine: Medicine.Common.Dto,
  ): Prisma.medicineUpdateInput & { id: string } {
    const {
      serial_number,
      company_serial_number,
      pharmacological_class,
      image,
    } = medicine;
    return {
      id: serial_number,
      company_serial_number,
      pharmacological_class: this.parsePharmacologicalClass(
        pharmacological_class,
      ),
      image_url: image,
    };
  }
}
