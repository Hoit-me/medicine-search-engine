import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { OpenApiResponse } from '@src/type';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
import {
  Observable,
  RetryConfig,
  catchError,
  map,
  mergeMap,
  range,
  retry,
  tap,
  toArray,
} from 'rxjs';

@Injectable()
export class UtilProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  /// ------------------------------------
  /// fetch OPEN API
  /// ------------------------------------
  fetchOpenApi$<T extends OpenApiResponse<any>>(
    url: string,
    retryOption: RetryConfig = {
      count: 3,
      delay: 3000,
    },
  ) {
    return this.httpService.get<T>(url).pipe(
      map((res) => res.data),
      map(({ body }) => body),
      retry(retryOption),
      catchError((err) => {
        console.log(err.message);
        return [];
      }),
    );
  }

  fetchOpenApiPages$<T>(
    urlBuilder: (apyKey: string, page: number, rows: number) => string,
    rows = 100,
    sort: 'ASC' | 'DESC' = 'ASC',
    retryOption: RetryConfig = {
      count: 3,
      delay: 3000,
    },
  ): Observable<T> {
    return this.fetchOpenApi$<OpenApiResponse<T>>(
      urlBuilder(process.env.API_KEY!, 1, rows),
      retryOption,
    )
      .pipe(
        map((res) => {
          const { numOfRows, totalCount } = res;
          const pageCount = Math.ceil(totalCount / numOfRows);
          return pageCount;
        }),
        mergeMap((pageCount) => range(1, pageCount)),
        toArray(),
        // tap((pages) => console.log(pages)),
        map((pages) => (sort === 'ASC' ? pages : pages.reverse())),
        mergeMap((pages) => pages),
      )
      .pipe(
        tap((page) => console.log(page)),
        mergeMap((page) =>
          this.fetchOpenApi$<OpenApiResponse<T>>(
            urlBuilder(process.env.API_KEY!, page, rows),
            retryOption,
          ),
        ),
        // tap((a) => console.log(a.numOfRows, a.pageNo, a.totalCount)),
        mergeMap((body) => body.items),
      );
  }

  // ------------------------------------
  // Parse
  // ------------------------------------
  /**
   * ex
   * 1. 20231231 -> new Date(2023-12-31)
   * 2. 2023-12-31 -> new Date(2023-12-31)
   * 3. null -> null
   * 4. undefined -> null
   */
  formatDate(dateString?: string | null) {
    return dateString
      ? new Date(dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      : null;
  }

  splitStringToArray(str?: string | null, separator = ',') {
    if (!str) return [];
    return str.split(separator);
  }

  /**
   * ex)
   *    '[code]name/[code]name' -> [{code, name}, {code, name}]
   */
  parseCodeNamePairs(str?: string | null, separator = '/') {
    if (!str) return [];
    const items = str.split(separator);
    const itemRegex = /\[(?<code>[A-Z0-9]+)\](?<name>.+)/;
    return items
      .map((item) => {
        const { code, name } = item.match(itemRegex)?.groups || {};
        return { code, name };
      })
      .filter(({ code }) => code);
  }

  convertOpenApiToDto<T extends object, U extends object>(
    openApi: T,
    keyMap: Record<keyof T, keyof U>,
  ): U {
    const args = typedEntries(keyMap);
    return renameKeys(openApi, args as [keyof T, string][], {
      undefinedToNull: true,
    }) as U;
  }
}
