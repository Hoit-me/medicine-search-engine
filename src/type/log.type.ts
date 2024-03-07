export namespace Log {
  export interface User {
    user_id: string;
    ip: string;
    user_agent: string;
    uri: string; /// real path /// ex: /api/v1/1234
    path: string; /// route path   /// ex: /api/v1/:id
    method: string;
    success: boolean;
    status_code: number;
    time: number;
    message: string;
  }

  export interface ApiKey {
    key: string;
    ip: string;

    uri: string;
    path: string;

    method: string;
    year: number;
    month: number;
    date: Date; // 사용시간

    status_code: number;
  }
}
