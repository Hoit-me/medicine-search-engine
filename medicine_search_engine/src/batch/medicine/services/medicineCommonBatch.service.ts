import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma, medicine } from '@prisma/client';
import { S3Service } from '@src/common/aws/s3/s3.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { COMMON_API_URL_BUILD } from '@src/constant';
import { Medicine } from '@src/type/medicine';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
import { bufferCount, map, mergeMap, of, retry } from 'rxjs';

@Injectable()
export class MedicineCommonBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  // ---------------------------------
  // BATCH
  // ---------------------------------
  async batch(sort: 'ASC' | 'DESC' = 'ASC') {
    return this.fetchOpenApiCommonList$(1, sort).pipe(
      map((common) => this.convertOpenApiCommonToMedicineCommon$(common)),
      bufferCount(100),
      mergeMap((common) => this.bulkCheckExistMedicine$(common)),
      mergeMap((c) => c),
      map((c) => this.checkUpdated$(c)),
      mergeMap(({ common, updated }) =>
        updated ? of(common) : this.uploadAndSetUpdatedImage$(common),
      ),
      map((common) => this.pickMedicineCommonData(common)),
      bufferCount(100),
      mergeMap((common) => this.bulkUpdateMeidicineCommon(common)),
      retry({ count: 3, delay: 5000 }),
    );
  }

  /// ---------------------------------
  /// FETCH MEDICINE COMMON PAGE
  /// ---------------------------------
  fetchOpenApiCommonPage$(pageNo: number, delayTime = 5000) {
    return this.httpService
      .get<Medicine.OpenApiCommonResponse>(
        COMMON_API_URL_BUILD(process.env.API_KEY!, pageNo),
      )
      .pipe(
        map(({ data }) => data.body),
        retry({ count: 3, delay: delayTime }),
      );
  }

  fetchOpenApiCommonList$(batchSize?: number, sort: 'ASC' | 'DESC' = 'ASC') {
    return this.fetchOpenApiCommonPage$(1).pipe(
      map((body) => {
        const totalCount = body.totalCount;
        const totalPage = Math.ceil(totalCount / 100);
        const pageList = Array.from({ length: totalPage }, (_, i) => i + 1);
        return pageList;
      }),
      map((pageList) => (sort === 'ASC' ? pageList : pageList.reverse())),
      mergeMap((page) => page),
      mergeMap(
        (pageNo) => this.fetchOpenApiCommonPage$(pageNo),
        batchSize || 1,
      ),
      mergeMap(({ items }) => items),
    );
  }

  fetchImageBuffer$(imageUrl: string) {
    return this.httpService
      .get(imageUrl, { responseType: 'arraybuffer' })
      .pipe(map(({ data }) => data));
  }

  /// ---------------------------------
  /// CONVERT MEDICINE COMMON
  /// ---------------------------------
  convertOpenApiCommonToMedicineCommon$(medicine: Medicine.OpenApiCommonDto) {
    const args = typedEntries(Medicine.OPEN_API_COMMON_TO_COMMON_KEY_MAP);
    const converted = renameKeys(medicine, args, {
      undefinedToNull: true,
    });
    return converted;
  }

  /// ---------------------------------
  /// DB
  /// ---------------------------------
  async bulkCheckExistMedicine$(medicineCommonList: Medicine.Common[]) {
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

  async bulkUpdateMeidicineCommon(
    updateInput: (Prisma.medicineUpdateInput & { id: string })[],
  ) {
    const updates = updateInput.map((input) => {
      const { id, product_type, company_serial_number, image_url } = input;
      const data = {
        ...(product_type ? { product_type } : {}),
        ...(company_serial_number ? { company_serial_number } : {}),
        ...(image_url ? { image_url } : {}),
      };
      return this.prisma.medicine.update({
        where: { id },
        data,
      });
    });
    return this.prisma.$transaction(updates);
  }

  /// ---------------------------------
  checkUpdated$({
    before,
    common,
  }: {
    before: medicine;
    common: Medicine.Common;
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

    const checkUpdated =
      !beforeImage?.includes(imageName) || beforeImage.includes('nedrug');
    if (checkUpdated) {
      return { common, updated: true };
    }

    return { common, updated: false };
  }

  /// ---------------------------------
  /// SET MEDICINE COMMON INFO
  /// ---------------------------------
  uploadAndSetUpdatedImage$(medicine: Medicine.Common) {
    const { image } = medicine;
    if (!image) return of(medicine);
    const imageName = image.split('/').pop();

    if (!imageName) return of(medicine);
    const imageKey = `medicines/${imageName}.jpg`;

    return this.fetchImageBuffer$(image).pipe(
      map((arrayBuffer) => Buffer.from(arrayBuffer)),
      mergeMap((buffer) =>
        this.s3Service.upload({
          bucket: process.env.AWS_S3_BUCKET!,
          key: imageKey,
          file: buffer,
        }),
      ),
      map((imageUrl) => ({ ...medicine, image_url: imageUrl })),
    );
  }

  pickMedicineCommonData(
    medicine: Medicine.Common,
  ): Prisma.medicineUpdateInput & { id: string } {
    const { serial_number, company_serial_number, product_type, image } =
      medicine;

    return {
      id: serial_number,
      company_serial_number,
      product_type,
      image_url: image,
    };
  }
}
