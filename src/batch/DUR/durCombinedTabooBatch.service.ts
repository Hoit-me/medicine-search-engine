import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_COMBINED_API_URL_BUILD } from '@src/constant/api_url';
import { Dur } from '@src/type/batch/dur';
import { filter, from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DurCombinedTabooBatchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly util: UtilProvider,
  ) {}

  /// ------------------------------------
  /// BATCH
  /// ------------------------------------
  batch$() {
    return this.util
      .fetchOpenApiPages$<{
        item: Dur.Ingredient.Combined.OpenApiDto;
      }>(DUR_COMBINED_API_URL_BUILD, 100, 2, 'ASC')
      .pipe(
        map(({ item }) => item),
        map((openApi) =>
          this.util.convertOpenApiToDto<
            Dur.Ingredient.Combined.OpenApiDto,
            Dur.Ingredient.Combined.Dto
          >(openApi, Dur.Ingredient.Combined.OPEN_API_DTO_KEY_MAP),
        ),
        filter((dto) => dto.deletion_status !== '삭제'),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        toArray(),
        mergeMap((data) => this.bulkUpsert$(data, 20)),
      );
  }

  /// ------------------------------------
  /// DB
  /// ------------------------------------
  bulkUpsert$(
    data: Prisma.dur_ingredient_combined_tabooCreateInput[],
    batchSize = 20,
  ) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.dur_ingredient_combined_taboo.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }

  convertDtoToPrismaSchema(
    dto: Dur.Ingredient.Combined.Dto,
  ): Prisma.dur_ingredient_combined_tabooCreateInput {
    const {
      dur_code,
      contraindication_dur_code,
      contraindication_related_ingredient,
      related_ingredient,
      contraindication_pharmacological_class,
      pharmacological_class,
      notification_date,
      prohibited_content,
      ...rest
    } = dto;
    const id = `${dur_code}-${contraindication_dur_code}`;
    const related_ingredients =
      this.util.parseCodeNamePairs(related_ingredient);
    const contraindication_related_ingredients = this.util.parseCodeNamePairs(
      contraindication_related_ingredient,
    );
    const _pharmacological_class = this.util.parseCodeNamePairs(
      pharmacological_class,
    );
    const _contraindication_pharmacological_class =
      this.util.parseCodeNamePairs(contraindication_pharmacological_class);
    const _notification_date = this.util.formatDate(notification_date);

    return {
      ...rest,
      id,
      dur_code,
      contraindication_dur_code,
      related_ingredients,
      contraindication_related_ingredients,
      pharmacological_class: _pharmacological_class,
      contraindication_pharmacological_class:
        _contraindication_pharmacological_class,
      notification_date: _notification_date,
      prohibited_content: prohibited_content ?? '',
    };
  }
}
