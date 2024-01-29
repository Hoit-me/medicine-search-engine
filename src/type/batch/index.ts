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
