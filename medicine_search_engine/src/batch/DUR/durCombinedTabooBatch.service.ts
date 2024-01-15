import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DUR_COMBINED_API_URL_BUILD } from '@src/constant';
import { Dur } from '@src/type/dur';
import { catchError, map, mergeMap, range, retry, toArray } from 'rxjs';

@Injectable()
export class DurCombinedTabooBatchService {
  constructor(private readonly httpService: HttpService) {}

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
}
