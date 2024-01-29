import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DISEASE_API_URL_BUILD } from '@src/constant/api_url';
import { Disease } from '@src/type/batch/disease';
import { bufferCount, from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DiseaseBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$() {
    return this.util
      .fetchOpenApiPagesType2$<Disease.OpenApiDto>(
        DISEASE_API_URL_BUILD,
        100,
        1,
        'ASC',
      )
      .pipe(
        map((openApi) =>
          this.util.convertOpenApiToDto<Disease.OpenApiDto, Disease.Dto>(
            openApi,
            Disease.OPEN_API_DTO_KEY_MAP,
          ),
        ),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        bufferCount(100),
        mergeMap((data) => this.bulkUpsert$(data), 1),
      );
  }

  convertDtoToPrismaSchema(dto: Disease.Dto): Prisma.diseaseCreateInput {
    const { code, type, complete_code_type } = dto;
    return {
      ...dto,
      type: type ?? '',
      complete_code_type: complete_code_type ?? '',
      id: code,
    };
  }

  bulkUpsert$(data: Prisma.diseaseCreateInput[], batchSize = 10) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.disease.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }
}
