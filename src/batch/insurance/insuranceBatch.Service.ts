import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { INSURANCE_API_URL_BUILD } from '@src/constant/api_url';
import { Insurance } from '@src/type/batch/insurance';
import { from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class InsuranceBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$() {
    return this.util
      .fetchOpenApiPagesType2$<Insurance.OpenApiDto>(
        INSURANCE_API_URL_BUILD,
        100,
        2,
        'ASC',
      )
      .pipe(
        map((insurance) =>
          this.util.convertOpenApiToDto<Insurance.OpenApiDto, Insurance.Dto>(
            insurance,
            Insurance.OPEN_API_DTO_KEY_MAP,
          ),
        ),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        toArray(),
        mergeMap((insurance) => this.bulkUpsert$(insurance, 10)),
      );
  }

  bulkUpsert$(
    insurances: Prisma.medicine_insuranceCreateInput[],
    batchSize = 10,
  ) {
    return from(insurances).pipe(
      mergeMap((insurance) => {
        const { insurance_code, ...rest } = insurance;
        return this.prisma.medicine_insurance.upsert({
          where: { insurance_code },
          create: {
            insurance_code,
            ...rest,
          },
          update: {
            ...rest,
          },
        });
      }, batchSize),
    );
  }

  convertDtoToPrismaSchema(
    dto: Insurance.Dto,
  ): Prisma.medicine_insuranceCreateInput {
    const { insurance_code, type, list_code, ...rest } = dto;
    return {
      insurance_code: insurance_code?.toString(),
      type: type?.toString(),
      list_code: list_code?.toString(),
      ...rest,
    };
  }
}
