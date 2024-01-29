import { Injectable } from '@nestjs/common';
import { Prisma, medicine_identification } from '@prisma/client';
import { UtilProvider } from '@src/batch/util.provider';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { IDENTIFICATION_API_URL_BUILD } from '@src/constant/api_url';
import { MedicineBatch } from '@src/type/batch/medicine';
import {
  Observable,
  bufferCount,
  catchError,
  from,
  map,
  mergeMap,
  of,
  toArray,
} from 'rxjs';

@Injectable()
export class MedicineIdentificationBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$(sort: 'ASC' | 'DESC' = 'ASC') {
    return this.util
      .fetchOpenApiPages$<MedicineBatch.Indentification.OpenApiDto>(
        IDENTIFICATION_API_URL_BUILD,
        100,
        1,
        sort,
      )
      .pipe(
        map((openApi) =>
          this.util.convertOpenApiToDto<
            MedicineBatch.Indentification.OpenApiDto,
            MedicineBatch.Indentification.Dto
          >(openApi, MedicineBatch.Indentification.OPEN_API_DTO_KEY_MAP),
        ),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        bufferCount(100),
        mergeMap(
          (prismaInputs) => this.bulkCheckAndCehckImageUpdated$(prismaInputs),
          5,
        ),
        mergeMap((prismaInputs) => this.bulkUpsert$(prismaInputs), 5),
        catchError((err) => {
          console.log(err.message, 'batch');
          return of([]);
        }),
      );
  }

  bulkCheckExist$(
    datas: Prisma.medicine_identificationCreateInput[],
  ): Observable<
    {
      now: Prisma.medicine_identificationCreateInput;
      before: medicine_identification | null;
    }[]
  > {
    const ids = datas.map((d) => d.id);
    return from(
      this.prisma.medicine_identification.findMany({
        where: { id: { in: ids } },
      }),
    ).pipe(
      map((exists) => {
        return datas.map((data) => ({
          now: data,
          before: exists.find((e) => e.id === data.id) || null,
        }));
      }),
    );
  }

  bulkUpsert$(
    data: Prisma.medicine_identificationCreateInput[],
    batchSize = 20,
  ) {
    console.log('bulkUpsert', data.length);
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.medicine_identification.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }

  convertDtoToPrismaSchema(
    dto: MedicineBatch.Indentification.Dto,
  ): Prisma.medicine_identificationCreateInput {
    const {
      serial_number,
      classification_name,
      form_code_name,
      image_created_date,
      item_approval_date,
      change_date,
      color_front,
      ...rest
    } = dto;
    const id = serial_number;
    const _classification_name = this.util.splitStringToArray(
      classification_name,
      ', ',
    );
    const _form_code_name = this.util.splitStringToArray(form_code_name, ', ');
    const _image_created_date = this.util.formatDate(image_created_date);
    const _item_approval_date = this.util.formatDate(item_approval_date);
    const _change_date = this.util.formatDate(change_date);
    return {
      ...rest,
      id,
      serial_number,
      color_front: color_front ?? '',
      classification_name: _classification_name,
      form_code_name: _form_code_name,
      image_created_date: _image_created_date,
      item_approval_date: _item_approval_date,
      change_date: _change_date,
    };
  }

  bulkCheckAndCehckImageUpdated$(
    inputs: Prisma.medicine_identificationCreateInput[],
    batchSize = 10,
  ) {
    return this.bulkCheckExist$(inputs).pipe(
      mergeMap((checkedList) => {
        return from(checkedList).pipe(
          mergeMap(
            ({ now, before }) => this.checkImageUpdated$({ now, before }),
            batchSize,
          ),
          toArray(),
        );
      }, batchSize),
    );
  }

  checkImageUpdated$({
    before,
    now,
  }: {
    before: medicine_identification | null;
    now: Prisma.medicine_identificationCreateInput;
  }) {
    now.image_url;
    return of(now).pipe(
      map((now) =>
        this.util.checkImageUpdatedKey('image_url', { now, before }),
      ),
      mergeMap(({ now, updated, key }) =>
        updated
          ? this.util.uploadAndSetUpdatedImageKey$(
              now,
              key,
              'identification/medicine',
            )
          : of(now),
      ),
      map((now) =>
        this.util.checkImageUpdatedKey('mark_code_front_image_url', {
          now,
          before,
        }),
      ),
      mergeMap(({ now, updated, key }) =>
        updated
          ? this.util.uploadAndSetUpdatedImageKey$(
              now,
              key,
              'identification/markFront',
            )
          : of(now),
      ),
      map((now) =>
        this.util.checkImageUpdatedKey('mark_code_back_image_url', {
          now,
          before,
        }),
      ),
      mergeMap(({ now, updated, key }) =>
        updated
          ? this.util.uploadAndSetUpdatedImageKey$(
              now,
              key,
              'identification/markBack',
            )
          : of(now),
      ),
    );
  }
}
