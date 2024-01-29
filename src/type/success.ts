export interface SUCCESS<T> {
  /**
   * Whether the request was successful
   */
  is_success: true;
  /**
   * Message
   * @example 'SUCCESS'
   */
  message: string;

  /**
   * Result
   * @example { id: 1, name: 'John' }
   */
  result: T;
}

export namespace SUCCESS {
  export type Filtered<T> = T extends SUCCESS<infer S> ? SUCCESS<S> : never;

  export type FilteredReturn<T extends (...args: any) => any> = Filtered<
    Awaited<ReturnType<T>>
  >;
}
