import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUPLICATE_EFFECT_API_URL_BUILD } from '@src/constant/api_url';
import { DurBatch } from '@src/type/batch/dur';
import { from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DurDuplicateEffectTabooBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$() {
    return this.util
      .fetchOpenApiPages$<{
        item: DurBatch.Ingredient.DuplicateEffect.OpenApiDto;
      }>(DUPLICATE_EFFECT_API_URL_BUILD, 100, 2, 'ASC')
      .pipe(
        map(({ item }) => item),
        map((openApi) =>
          this.util.convertOpenApiToDto<
            DurBatch.Ingredient.DuplicateEffect.OpenApiDto,
            DurBatch.Ingredient.DuplicateEffect.Dto
          >(openApi, DurBatch.Ingredient.DuplicateEffect.OPEN_API_DTO_KEY_MAP),
        ),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        toArray(),
        mergeMap((data) => this.bulkUpsert$(data, 20)),
      );
  }

  bulkUpsert$(
    data: Prisma.dur_ingredient_duplicate_effect_tabooCreateInput[],
    batchSize = 20,
  ) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.dur_ingredient_duplicate_effect_taboo.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }

  /// ------------------------------------
  /// CONVERT DTO
  /// ------------------------------------
  convertDtoToPrismaSchema(
    dto: DurBatch.Ingredient.DuplicateEffect.Dto,
  ): Prisma.dur_ingredient_duplicate_effect_tabooCreateInput {
    const {
      dur_code,
      related_ingredient,
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
    const _notification_date = this.util.formatDate(notification_date);

    return {
      ...rest,
      id,
      dur_code,
      related_ingredients,
      pharmacological_class: _pharmacological_class,
      prohibited_content: prohibited_content ?? '',
      notification_date: _notification_date,
    };
  }
}
