import { OpenApiResponse2 } from '.';

export namespace InsuranceBatch {
  export interface Dto {
    insurance_code: number; // 제품코드
    name: string; // 제품명
    main_ingredient_code: string; // 주성분코드
    type: number; // 분류
    company: string; // 업체명
    standard: string; // 규격
    unit: string; // 단위
    max_price: string; // 상한금액
    is_special: string; // 전문일반구분  "전문" | "일반"
    note?: string; // 비고
    list_code?: number; // 목록정비전코드
    administration: string; // 투여
  }
  export interface OpenApiDto {
    제품코드: number;
    제품명: string;
    주성분코드: string;
    분류: number;
    업체명: string;
    규격: string;
    단위: string;
    상한금액: string;
    전문일반구분: string;
    비고?: string;
    목록정비전코드?: number;
    투여: string;
  }

  export type OpenApiResponse = OpenApiResponse2<OpenApiDto>;
  export type Keys = keyof Dto;
  export type OpenApiKeys = keyof OpenApiDto;
  export type OpenApiDtoKeyMap = Record<OpenApiKeys, Keys>;
  export const OPEN_API_DTO_KEY_MAP: OpenApiDtoKeyMap = {
    제품코드: 'insurance_code',
    제품명: 'name',
    주성분코드: 'main_ingredient_code',
    분류: 'type',
    업체명: 'company',
    규격: 'standard',
    단위: 'unit',
    상한금액: 'max_price',
    전문일반구분: 'is_special',
    비고: 'note',
    목록정비전코드: 'list_code',
    투여: 'administration',
  };
}
