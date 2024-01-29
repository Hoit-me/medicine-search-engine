import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_PERIOD_API_URL_BUILD } from '@src/constant/api_url';
import { DurBatch } from '@src/type/batch/dur';
import { from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DurPeriodTabooBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$() {
    return this.util
      .fetchOpenApiPages$<{
        item: DurBatch.Ingredient.Period.OpenApiDto;
      }>(DUR_PERIOD_API_URL_BUILD, 100, 2, 'ASC')
      .pipe(
        map(({ item }) => item),
        map((openApi) =>
          this.util.convertOpenApiToDto<
            DurBatch.Ingredient.Period.OpenApiDto,
            DurBatch.Ingredient.Period.Dto
          >(openApi, DurBatch.Ingredient.Period.OPEN_API_DTO_KEY_MAP),
        ),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        toArray(),
        mergeMap((data) => this.bulkUpsert$(data, 20)),
      );
  }

  /// ------------------------------------
  /// DB
  /// ------------------------------------
  bulkUpsert$(
    data: Prisma.dur_ingredient_period_tabooCreateInput[],
    batchSize = 20,
  ) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.dur_ingredient_period_taboo.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }

  convertDtoToPrismaSchema(
    dto: DurBatch.Ingredient.Period.Dto,
  ): Prisma.dur_ingredient_period_tabooCreateInput {
    const {
      dur_code,
      related_ingredient,
      form,
      prohibited_content,
      notification_date,
      dur_seq: _,
      ...rest
    } = dto;

    const id = dur_code;
    const related_ingredients =
      this.util.parseCodeNamePairs(related_ingredient);
    const _pharmacological_class = this.util.parseCodeNamePairs(
      dto.pharmacological_class,
    );
    const forms = this.util.splitStringToArray(form, '/');
    const _notification_date = this.util.formatDate(notification_date);

    return {
      ...rest,
      id,
      dur_code,
      related_ingredients,
      pharmacological_class: _pharmacological_class,
      forms,
      prohibited_content: prohibited_content ?? '',
      notification_date: _notification_date,
    };
  }
}
