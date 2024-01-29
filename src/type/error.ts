import { ErrorHttpStatusCode } from '@nestjs/common/utils/http-error-by-code.util';

export interface ERROR<T, H extends ErrorHttpStatusCode> {
  is_success: false;
  message: T;
  status: H;
}

export namespace ERROR {
  export type Filtered<T, H extends ErrorHttpStatusCode> =
    T extends ERROR<infer S, H> ? ERROR<S, H> : never;

  export type FilteredReturn<T extends (...args: any) => any> = Filtered<
    Awaited<ReturnType<T>>,
    ErrorHttpStatusCode
  >;

  export type FilteredNot<T> = T extends ERROR<any, any> ? never : T;

  export type FilteredNotReturn<T extends (...args: any) => any> = FilteredNot<
    Awaited<ReturnType<T>>
  >;
}
