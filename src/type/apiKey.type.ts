import { STATUS } from '@prisma/client';

export interface ApiKey {
  id: string;
  key: string;
  name: string;
  user_id: string;
  default_limit: number;
  status: STATUS;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
export namespace ApiKey {
  export interface CreateDto {
    /**
     * API 키 이름
     * @default 'default'
     */
    name?: string;

    /**
     * API 키 과금 플랜 ID
     *
     * 해당 요소는 과금 정책에 따라 선택적으로 사용됩니다.
     * 현재는 사용되지 않습니다.
     * - 결제기능이 추가되면 사용될 예정입니다.
     */
    // plan_id?: string;
  }

  export interface DeleteDto {
    /**
     * 삭제할 API 키
     */
    key: string;
  }

  export interface MonthlyUsage {
    id: string;
    key: string;
    year: number;
    month: number;
    usage: number;
    monthly_limit: number;
    created_at: Date;
    updated_at: Date;
  }

  export interface UsageLog {
    id: string;
    key: string;
    ip: string;
    uri: string;
    path: string;
    status_code: number;
    year: number;
    month: number;
    method: string;
    date: Date;
    time: number;
    created_at: Date;
    updated_at: Date;
  }

  export type GetDetailOutput = ApiKey & {
    api_key_monthly_usage: MonthlyUsage[];
    api_key_usage_log: UsageLog[];
    _count: {
      api_key_monthly_usage: number;
      api_key_usage_log: number;
    };
  };

  export type GetListOutput = (ApiKey & {
    api_key_monthly_usage: MonthlyUsage[];
    api_key_usage_log: UsageLog[];
    _count: {
      api_key_monthly_usage: number;
      api_key_usage_log: number;
    };
  })[];

  export type UsageCache = {
    monthly_limit: number;
    usage: number;
  };
  export type CurrentApiKey = {
    key: string;
    monthly_limit: number;
    usage: number;
  };
}
