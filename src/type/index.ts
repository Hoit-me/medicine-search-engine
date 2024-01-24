import { HttpException } from '@nestjs/common';
import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export type FilteredError<T> =
  T extends ERROR<infer S, infer H> ? ERROR<S, H> : never;

export type FilteredErrorReturn<T extends (...args: any) => any> =
  FilteredError<Awaited<ReturnType<T>>>;

export type FilterdedSuccess<T> = T extends SUCCESS<infer S> ? S : never;

export type FilterdedSuccessReturn<T extends (...args: any) => any> =
  FilterdedSuccess<Awaited<ReturnType<T>>>;

export type FilteredNotError<T> = T extends ERROR<any, any> ? never : T;
export type FilteredNotErrorReturn<T extends (...args: any) => any> =
  FilteredNotError<Awaited<ReturnType<T>>>;

export interface ERROR<T, H extends ErrorHttpStatusCode> {
  is_success: false;
  message: T;
  status: H;
}

export interface SUCCESS<T> {
  is_success: true;
  message: string;
  result: T;
}

export const isError = (
  error: any,
): error is ERROR<string, ErrorHttpStatusCode> => {
  if (error?.is_success === false) {
    return true;
  }
  return false;
};

export const throwError = (err: ERROR<string, ErrorHttpStatusCode>) => {
  throw new HttpException(err, err.status);
};

export const createResponse = <T>(
  result: T,
  message: string = 'SUCCESS',
): SUCCESS<T> => ({
  is_success: true,
  message,
  result,
});

export interface OpenApiDTO<T> {
  pageNo: number;
  numOfRows: number;
  totalCount: number;
  items: T[];
}

export interface OpenApiResponse<T> {
  body: OpenApiDTO<T>;
  header: {
    resultCode: string;
    resultMsg: string;
  };
}

export interface OpenApiResponse2<T> {
  page: number;
  perPage: number;
  totalCount: number;
  currentCount: number;
  matchCount: number;
  data: T[];
}

export type HasImage = {
  image_url?: string;
};

export type HasKey<T extends string> = {
  [key in T]?: string | null;
};

export type HasImage2 = HasKey<'image_url'>;

export type PageSearch = {
  page: number;
  limit: number;
  search?: string;
};
