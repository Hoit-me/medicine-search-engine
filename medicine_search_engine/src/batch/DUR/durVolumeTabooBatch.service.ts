import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_VOLUME_API_URL_BUILD } from '@src/constant';
import { Dur } from '@src/type/dur';
import { from, map, mergeMap, toArray } from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DurVolumeTabooBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch$() {
    return this.util
      .fetchOpenApiPages$<{ item: Dur.Ingredient.Volume.OpenApiDto }>(
        DUR_VOLUME_API_URL_BUILD,
        100,
        'ASC',
      )
      .pipe(
        map(({ item }) => item),
        map((openApi) =>
          this.util.convertOpenApiToDto<
            Dur.Ingredient.Volume.OpenApiDto,
            Dur.Ingredient.Volume.Dto
          >(openApi, Dur.Ingredient.Volume.OPEN_API_DTO_KEY_MAP),
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
    data: Prisma.dur_ingredient_volume_tabooCreateInput[],
    batchSize = 20,
  ) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.dur_ingredient_volume_taboo.upsert({
          where: { id },
          create: data,
          update: rest,
        });
      }, batchSize),
      toArray(),
    );
  }

  convertDtoToPrismaSchema(
    dto: Dur.Ingredient.Volume.Dto,
  ): Prisma.dur_ingredient_volume_tabooCreateInput {
    const {
      dur_code,
      related_ingredient,
      form,
      prohibited_content,
      notification_date,
      max_quantity,
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
    const _max_quantity = max_quantity ?? '';
    return {
      ...rest,
      id,
      dur_code,
      related_ingredients,
      pharmacological_class: _pharmacological_class,
      forms,
      prohibited_content: prohibited_content ?? '',
      notification_date: _notification_date,
      max_quantity: _max_quantity,
    };
  }
}
