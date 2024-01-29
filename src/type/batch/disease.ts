import { OpenApiResponse2 } from '.';

export namespace DiseaseBatch {
  export interface Dto {
    kor_name: string;
    eng_name: string;
    code: string; // 상병기호
    complete_code_type?: string; // 완전코드구분
    // 법정감염병구분
    type?: string;
    // 성별구분
    gender_type?: string;
    // 양한방구분
    oriental_type: string;
    // 주상병사용구분
    main_disease_type?: string;
    // 하한연령
    min_age?: number;
    // 상한연령
    max_age?: number;
  }

  /**
   * ## Example
   * {
   * "상병기호": "string",
   * "한글명": "string",
   * "영문명": "string",
   * "완전코드구분": "string",
   * "주상병사용구분": "string",
   * "법정감염병구분": "string",
   * "성별구분": "string",
   * "상한연령": 0,
   * "하한연령": 0,
   * "양한방구분": "string"
   * }
   */
  export interface OpenApiDto {
    법정감염병구분?: string;
    상병기호: string;
    성별구분?: string;
    양한방구분: string;
    한글명: string;
    영문명: string;
    완전코드구분?: string;
    주상병사용구분?: string;
    하한연령?: number;
    상한연령?: number;
  }

  export type OpenApiResponseDto = OpenApiResponse2<OpenApiDto>;
  export type DtoKeys = keyof Dto;
  export type OpenApiDtoKey = keyof OpenApiDto;
  export type OpenApiDtoToDtoKeyMap = Record<OpenApiDtoKey, DtoKeys>;
  export const OPEN_API_DTO_KEY_MAP: OpenApiDtoToDtoKeyMap = {
    법정감염병구분: 'type',
    상병기호: 'code',
    성별구분: 'gender_type',
    양한방구분: 'oriental_type',
    한글명: 'kor_name',
    영문명: 'eng_name',
    완전코드구분: 'complete_code_type',
    주상병사용구분: 'main_disease_type',
    하한연령: 'min_age',
    상한연령: 'max_age',
  };
}
