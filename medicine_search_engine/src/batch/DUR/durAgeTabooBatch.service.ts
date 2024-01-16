import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_AGE_API_URL_BUILD } from '@src/constant';
import { Dur } from '@src/type/dur';
import {
  catchError,
  filter,
  from,
  map,
  mergeMap,
  range,
  retry,
  toArray,
} from 'rxjs';
import { UtilProvider } from '../util.provider';

@Injectable()
export class DurAgeTabooBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
    private readonly util: UtilProvider,
  ) {}

  /// ------------------------------------
  /// BATCH
  /// ------------------------------------
  batch$() {
    return this.util
      .fetchOpenApiPages$<{ item: Dur.Ingredient.Age.OpenApiDto }>(
        DUR_AGE_API_URL_BUILD,
        100,
        'ASC',
      )
      .pipe(
        map(({ item }) => item),
        map((openApi) =>
          this.util.convertOpenApiToDto<
            Dur.Ingredient.Age.OpenApiDto,
            Dur.Ingredient.Age.Dto
          >(openApi, Dur.Ingredient.Age.OPEN_API_DTO_KEY_MAP),
        ),
        filter((dto) => dto.deletion_status !== '삭제'),
        map((dto) => this.convertDtoToPrismaSchema(dto)),
        toArray(),
        mergeMap((data) => this.bulkUpsert$(data, 20)),
      );
  }
  /// ------------------------------------
  /// FETCH OPEN API
  /// ------------------------------------
  fetchOpenApi$(pageNum: number, rows = 100) {
    return this.httpService
      .get<Dur.Ingredient.Age.OpenApiResponseDto>(
        DUR_AGE_API_URL_BUILD(process.env.API_KEY!, pageNum, rows),
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
        map(({ item }) => item),
      );
  }

  /// ------------------------------------
  /// DB
  /// ------------------------------------
  bulkUpsert$(
    data: Prisma.dur_ingredient_age_tabooCreateInput[],
    batchSize = 20,
  ) {
    return from(data).pipe(
      mergeMap((data) => {
        const { id, ...rest } = data;
        return this.prisma.dur_ingredient_age_taboo.upsert({
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
    dto: Dur.Ingredient.Age.Dto,
  ): Prisma.dur_ingredient_age_tabooCreateInput {
    const {
      dur_code,
      related_ingredient,
      form,
      prohibited_content,
      notification_date,
      age_base,
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
    const [_age, base] = this.util.splitStringToArray(age_base, ' ');
    const age = _age.replace(/세/g, '');

    return {
      ...rest,
      id,
      dur_code,
      related_ingredients,
      pharmacological_class: _pharmacological_class,
      forms,
      prohibited_content: prohibited_content ?? '',
      notification_date: _notification_date,
      age,
      base,
    };
  }
}
