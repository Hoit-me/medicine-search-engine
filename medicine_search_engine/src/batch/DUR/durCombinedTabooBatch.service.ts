import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma, compound } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_COMBINED_API_URL_BUILD } from '@src/constant';
import { Dur } from '@src/type/dur';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
import { catchError, from, map, mergeMap, range, retry, toArray } from 'rxjs';

@Injectable()
export class DurCombinedTabooBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /// ------------------------------------
  /// BATCH
  /// ------------------------------------
  batch() {
    return this.fetchOpenApiPages$(1, 100, 'ASC').pipe(
      map((openApi) => this.convertOpenApiToDto$(openApi)),
      map((dto) => this.convertDtoToPrismaSchema$(dto)),
      toArray(),
      mergeMap((data) => this.bulkUpsert$(data, 20)),
    );
  }

  /// ------------------------------------
  /// FETCH OPEN API
  /// ------------------------------------
  fetchOpenApi$(pageNum: number, rows = 100) {
    return this.httpService
      .get<Dur.Ingredient.Combined.OpenApiResponseDto>(
        DUR_COMBINED_API_URL_BUILD(process.env.API_KEY!, pageNum, rows),
      )
      .pipe(
        map((res) => res.data),
        map(({ body }) => body),
        retry({
          count: 3,
          delay: 3000,
        }),
        catchError((err) => {
          console.log(pageNum, err.message);
          return [];
        }),
      );
  }

  fetchOpenApiPages$(batchSize = 1, rows = 100, sort: 'ASC' | 'DESC' = 'ASC') {
    return this.fetchOpenApi$(1, rows)
      .pipe(
        // 페이지 리스트 생성
        map((res) => {
          const { numOfRows, totalCount } = res;
          const pageCount = Math.ceil(totalCount / numOfRows);
          return pageCount;
        }),
        mergeMap((pageCount) => range(1, pageCount)),
        toArray(),
        map((pages) => (sort === 'ASC' ? pages : pages.reverse())),
        mergeMap((pages) => pages),
      )
      .pipe(
        // 페이지 순회 및 가공
        mergeMap((page) => this.fetchOpenApi$(page, rows), batchSize),
        mergeMap((body) => body.items),
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

  /// ------------------------------------
  /// CONVERT DTO
  /// ------------------------------------
  convertOpenApiToDto$(
    openApi: Dur.Ingredient.Combined.OpenApiDto,
  ): Dur.Ingredient.Combined.Dto {
    const args = typedEntries(Dur.Ingredient.Combined.OPEN_API_DTO_KEY_MAP);
    return renameKeys(openApi, args, {
      undefinedToNull: true,
    });
  }

  convertDtoToPrismaSchema$(
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
    } = dto;
    const id = `${dur_code}-${contraindication_dur_code}`;
    const related_ingredients = this.parseCode(related_ingredient);
    const contraindication_related_ingredients = this.parseCode(
      contraindication_related_ingredient,
    );
    const _pharmacological_class = this.parseCode(pharmacological_class);
    const _contraindication_pharmacological_class = this.parseCode(
      contraindication_pharmacological_class,
    );
    const _notification_date = this.formatDate(notification_date);

    return {
      ...dto,
      id,
      related_ingredients,
      contraindication_related_ingredients,
      pharmacological_class: _pharmacological_class,
      contraindication_pharmacological_class:
        _contraindication_pharmacological_class,
      notification_date: _notification_date,
    };
  }

  /// ------------------------------------
  /// UTILS
  /// ------------------------------------
  parseCode(compoundsStr?: string | null, separator = '/'): compound[] {
    // "[M040702]포도당/[M040426]염화나트륨",
    if (!compoundsStr) return [];

    const compounds = compoundsStr.split(separator);
    const compoundRegex = /\[(?<code>[A-Z0-9]+)\](?<name>.+)/;
    return compounds
      .map((compound) => {
        const { code, name } = compound.match(compoundRegex)?.groups ?? {};
        return {
          code,
          name,
        };
      })
      .filter(({ code }) => code);
  }

  formatDate(dateString?: string | null) {
    return dateString
      ? new Date(dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      : null;
  }
}
