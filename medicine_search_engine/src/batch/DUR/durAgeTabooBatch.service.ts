import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma, compound } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DUR_AGE_API_URL_BUILD } from '@src/constant';
import { Dur } from '@src/type/dur';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
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

@Injectable()
export class DurAgeTabooBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /// ------------------------------------
  /// BATCH
  /// ------------------------------------
  batch() {
    return this.fetchOpenApiPages$(1, 100, 'ASC').pipe(
      map((openApi) => this.convertOpenApiToDto(openApi)),
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
  convertOpenApiToDto(
    openApi: Dur.Ingredient.Age.OpenApiDto,
  ): Dur.Ingredient.Age.Dto {
    const args = typedEntries(Dur.Ingredient.Age.OPEN_API_DTO_KEY_MAP);
    return renameKeys(openApi, args, {
      undefinedToNull: true,
    });
  }

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
    const related_ingredients = this.parseCode(related_ingredient);
    const _pharmacological_class = this.parseCode(dto.pharmacological_class);
    const forms = this.parseString(form, '/');
    const _notification_date = this.formatDate(notification_date);
    const [_age, base] = this.parseString(age_base, ' ');
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
  parseString(str?: string | null, separator = ',') {
    if (!str) return [];
    return str.split(separator);
  }
}
