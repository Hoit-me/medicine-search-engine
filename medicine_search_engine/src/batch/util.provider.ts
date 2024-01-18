import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { S3Service } from '@src/common/aws/s3/s3.service';
import { HasKey, OpenApiResponse, OpenApiResponse2 } from '@src/type';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
import {
  Observable,
  RetryConfig,
  catchError,
  filter,
  map,
  mergeMap,
  of,
  range,
  retry,
  toArray,
} from 'rxjs';

@Injectable()
export class UtilProvider {
  constructor(
    private readonly httpService: HttpService,
    private readonly s3Service: S3Service,
  ) {}

  /// ------------------------------------
  /// fetch OPEN API DUR, Medicine
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
        console.log(err.message, 'fetchOpenApi$', url);
        return of({ items: [], numOfRows: 0, pageNo: 0, totalCount: 0 });
      }),
    );
  }

  fetchOpenApiPages$<T>(
    urlBuilder: (page: number, rows: number) => string,
    rows = 100,
    batchSize = 2,
    sort: 'ASC' | 'DESC' = 'ASC',
    retryOption: RetryConfig = {
      count: 3,
      delay: 3000,
    },
  ): Observable<T> {
    return this.fetchOpenApi$<OpenApiResponse<T>>(
      urlBuilder(1, rows),
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
        filter((page) => page === 3),
        mergeMap(
          (page) =>
            this.fetchOpenApi$<OpenApiResponse<T>>(
              urlBuilder(page, rows),
              retryOption,
            ),
          batchSize,
        ),

        mergeMap((body) => body.items),
        catchError((err) => {
          console.log(err.message, 'fetchOpenApiPages$');
          return [];
        }),
      );
  }

  fetchBuffer(url: string) {
    return this.httpService.get(url, { responseType: 'arraybuffer' }).pipe(
      map(({ data }) => data),
      map((buffer) => Buffer.from(buffer)),
      retry({ count: 3, delay: 5000 }),
      catchError((err) => {
        console.log(err.message, 'fetchBuffer');
        return of(Buffer.from([]));
      }),
    );
  }

  /// ------------------------------------
  /// FETCH Insurance
  /// ------------------------------------
  fetchOpenApiType2$<T extends OpenApiResponse2<any>>(
    url: string,
    retryOption: RetryConfig = {
      count: 3,
      delay: 3000,
    },
  ) {
    return this.httpService.get<T>(url).pipe(
      map((res) => res.data),
      retry(retryOption),
      catchError((err) => {
        console.log(err.message);
        return [];
      }),
    );
  }

  fetchOpenApiPagesType2$<T>(
    urlBuilder: (page: number, rows: number) => string,
    rows = 100,
    batchSize = 2,
    sort: 'ASC' | 'DESC' = 'ASC',
    retryOption: RetryConfig = {
      count: 3,
      delay: 3000,
    },
  ): Observable<T> {
    return this.fetchOpenApiType2$<OpenApiResponse2<T>>(
      urlBuilder(1, rows),
      retryOption,
    )
      .pipe(
        map((res) => {
          const { perPage, totalCount } = res;
          const pageCount = Math.ceil(totalCount / perPage);
          return pageCount;
        }),
        mergeMap((pageCount) => range(1, pageCount)),
        toArray(),
        map((pages) => (sort === 'ASC' ? pages : pages.reverse())),
        mergeMap((pages) => pages),
      )
      .pipe(
        mergeMap(
          (page) =>
            this.fetchOpenApiType2$<OpenApiResponse2<T>>(
              urlBuilder(page, rows),
              retryOption,
            ),
          batchSize,
        ),
        mergeMap((body) => body.data),
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

  checkImageUpdatedKey<
    K extends string,
    T extends HasKey<K>,
    U extends HasKey<K>,
  >(
    key: K,
    { now, before }: { now: T; before?: U | null },
    source: string = 'nedrug',
  ) {
    if (!before) return { now, updated: true, key };
    const now_image_url = now[key];
    const before_image_url = before[key];

    if (!now_image_url) return { now, updated: false, key };

    const imageName = now_image_url.split('/').pop();
    if (!imageName) return { now, updated: true, key };

    const checkImageUpdated =
      !before_image_url?.includes(imageName) ||
      (before_image_url.includes(source) &&
        !now_image_url.includes('amazonaws'));

    if (checkImageUpdated) {
      return { now, updated: true, key };
    }

    return { now: { ...now, [key]: before_image_url }, updated: false, key };
  }

  uploadAndSetUpdatedImageKey$<K extends string, T extends HasKey<K>>(
    data: T,
    objkey: K,
    key: string,
  ) {
    const { [objkey]: image_url } = data;
    if (!image_url) return of(data);

    const imageName = image_url?.split('/').pop();
    if (!imageName) return of(data);

    const imageKey = `${key}/${imageName}.jpg`;
    const new_image_url = `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/${imageKey}`;
    return this.fetchBuffer(image_url).pipe(
      mergeMap((buffer) =>
        this.s3Service.upload({
          bucket: process.env.AWS_S3_BUCKET!,
          key: imageKey,
          file: buffer,
        }),
      ),
      map(() => ({ ...data, [objkey]: new_image_url })),
      retry({ count: 3, delay: 5000 }),
    );
  }
}
