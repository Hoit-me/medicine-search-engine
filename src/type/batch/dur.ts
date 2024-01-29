import { OpenApiResponse } from '.';

export namespace DurBatch {
  export namespace Ingredient {
    // ------------------------------------
    // COMBINED - 병용금기
    // ------------------------------------
    export namespace Combined {
      export interface Dto {
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        contraindication_mix_type: string; // 병용금기단일/복합
        contraindication_dur_code: string; // 병용금기DUR성분코드
        contraindication_eng_name: string; // 병용금기DUR성분(영문)
        contraindication_kor_name: string; // 병용금기DUR성분
        contraindication_mix: string; // 병용금기복합제
        contraindication_related_ingredient: string; // 병용금기관계성분
        contraindication_pharmacological_class: string; // 병용금기약효분류
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks: string; // 비고
        deletion_status: string; // 상태
      }

      /**
       * ## EXAMPLE
       * <TYPE_NAME>병용금기</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000762</INGR_CODE>
       * <INGR_ENG_NAME>Itraconazole</INGR_ENG_NAME>
       * <INGR_KOR_NAME>이트라코나졸</INGR_KOR_NAME>
       * <MIX/>
       * <ORI>[M083733]이트라코나졸제피과립/[M083734]이트라코나졸/[M092870]이트라코나졸고체분산체/[M201487]이트라코나졸고체분산/[M201624]제피이트라코나졸과립</ORI>
       * <CLASS>[06290]기타의 화학요법제</CLASS>
       * <MIXTURE_MIX_TYPE>단일</MIXTURE_MIX_TYPE>
       * <MIXTURE_INGR_CODE>D000419</MIXTURE_INGR_CODE>
       * <MIXTURE_INGR_ENG_NAME>Lovastatin</MIXTURE_INGR_ENG_NAME>
       * <MIXTURE_INGR_KOR_NAME>로바스타틴</MIXTURE_INGR_KOR_NAME>
       * <MIXTURE_MIX/>
       * <MIXTURE_ORI>[M083392]로바스타틴</MIXTURE_ORI>
       * <MIXTURE_CLASS>[02180]동맥경화용제</MIXTURE_CLASS>
       * <NOTIFICATION_DATE>20090303</NOTIFICATION_DATE>
       * <PROHBT_CONTENT>횡문근융해증 </PROHBT_CONTENT>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       */
      export interface OpenApiDto {
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_KOR_NAME: string; // DUR성분
        MIX?: string; // 복합제
        ORI: string; // 관계성분
        CLASS: string; // 약효분류
        MIXTURE_MIX_TYPE: string; // 병용금기단일/복합
        MIXTURE_INGR_CODE: string; // 병용금기DUR성분코드
        MIXTURE_INGR_ENG_NAME: string; // 병용금기DUR성분(영문)
        MIXTURE_INGR_KOR_NAME: string; // 병용금기DUR성분
        MIXTURE_MIX: string; // 병용금기복합제
        MIXTURE_ORI: string; // 병용금기관계성분
        MIXTURE_CLASS: string; // 병용금기약효분류
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK: string; // 비고
        DEL_YN: string; // 상태
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;

      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_KOR_NAME: 'ingredient_kor_name',
        MIX: 'mix',
        ORI: 'related_ingredient',
        CLASS: 'pharmacological_class',
        MIXTURE_MIX_TYPE: 'contraindication_mix_type',
        MIXTURE_INGR_CODE: 'contraindication_dur_code',
        MIXTURE_INGR_ENG_NAME: 'contraindication_eng_name',
        MIXTURE_INGR_KOR_NAME: 'contraindication_kor_name',
        MIXTURE_MIX: 'contraindication_mix',
        MIXTURE_ORI: 'contraindication_related_ingredient',
        MIXTURE_CLASS: 'contraindication_pharmacological_class',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
      };
    }

    // ------------------------------------
    // 특정연령금기
    // ------------------------------------
    export namespace Age {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        age_base: string; // 연령
        form: string; // 제형
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
      }

      /**
       * ## EXAMPLE
       * <DUR_SEQ>455</DUR_SEQ>
       * <TYPE_NAME>특정연령대금기</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000149</INGR_CODE>
       * <INGR_ENG_NAME>Acarbose</INGR_ENG_NAME>
       * <INGR_NAME>아카보즈</INGR_NAME>
       * <MIX_INGR/>
       * <ORI_INGR>[M085039]아카보즈</ORI_INGR>
       * <CLASS_NAME>[03960]당뇨병용제</CLASS_NAME>
       * <FORM_NAME>정제</FORM_NAME>
       * <NOTIFICATION_DATE>20140109</NOTIFICATION_DATE>
       * <PROHBT_CONTENT>안전성 및 유효성 미확립</PROHBT_CONTENT>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       * <AGE_BASE>18세 이하</AGE_BASE>
       */
      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        CLASS_NAME: string; // 약효분류
        FORM_NAME: string; // 제형
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
        AGE_BASE: string; // 연령
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        CLASS_NAME: 'pharmacological_class',
        FORM_NAME: 'form',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
        AGE_BASE: 'age_base',
      };
    }

    // ------------------------------------
    // 임부금기
    // ------------------------------------
    export namespace Pregnant {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
        grade: string; // 임부등급
        form: string; // 제형
      }

      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        CLASS_NAME: string; // 약효분류
        FORM_NAME: string; // 제형
        GRADE: string; // 임부등급
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        CLASS_NAME: 'pharmacological_class',
        FORM_NAME: 'form',
        GRADE: 'grade',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
      };
    }

    export namespace Volume {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
        form: string; // 제형
        max_quantity: string; // 용량
      }

      /**
       * ## EXAMPLE
       * <DUR_SEQ>809</DUR_SEQ>
       * <TYPE_NAME>용량주의</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000456</INGR_CODE>
       * <INGR_ENG_NAME>Alacepril</INGR_ENG_NAME>
       * <INGR_NAME>알라세프릴</INGR_NAME>
       * <MIX_INGR/>
       * <ORI_INGR>[M091774]알라세프릴</ORI_INGR>
       * <CLASS_NAME>[02140]혈압강하제</CLASS_NAME>
       * <FORM_NAME>정제</FORM_NAME>
       * <MAX_QTY>알라세프릴 100밀리그램</MAX_QTY>
       * <NOTIFICATION_DATE>20130703</NOTIFICATION_DATE>
       * <PROHBT_CONTENT/>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       */
      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        CLASS_NAME: string; // 약효분류
        FORM_NAME: string; // 제형
        MAX_QTY: string; // 용량
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        CLASS_NAME: 'pharmacological_class',
        FORM_NAME: 'form',
        MAX_QTY: 'max_quantity',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
      };
    }

    export namespace Period {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
        form: string; // 제형
        max_period: string; // 기간
      }

      /**
       * ## EXAMPLE
       * <DUR_SEQ>460</DUR_SEQ>
       * <TYPE_NAME>투여기간주의</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000271</INGR_CODE>
       * <INGR_ENG_NAME>Zolpidem tartrate</INGR_ENG_NAME>
       * <INGR_NAME>졸피뎀타르타르산염</INGR_NAME>
       * <MIX_INGR/>
       * <ORI_INGR>[M088392]주석산졸피뎀/[M222883]졸피뎀타르타르산/[M239566]졸피뎀타르타르산염/[M261178]졸피뎀타르타르산염</ORI_INGR>
       * <CLASS_NAME>[01120]최면진정제</CLASS_NAME>
       * <FORM_NAME>정제/서방성필름코팅정</FORM_NAME>
       * <MAX_DOSAGE_TERM>28일</MAX_DOSAGE_TERM>
       * <NOTIFICATION_DATE>20141230</NOTIFICATION_DATE>
       * <PROHBT_CONTENT/>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       */
      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        CLASS_NAME: string; // 약효분류
        FORM_NAME: string; // 제형
        MAX_DOSAGE_TERM: string; // 용량
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
      }
      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        CLASS_NAME: 'pharmacological_class',
        FORM_NAME: 'form',
        MAX_DOSAGE_TERM: 'max_period',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
      };
    }

    export namespace Old {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        related_ingredient: string; // 관계성분
        form?: string; // 제형
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
      }

      /**
       * <DUR_SEQ>1</DUR_SEQ>
       * <TYPE_NAME>노인주의</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000056</INGR_CODE>
       * <INGR_ENG_NAME>Chlordiazepoxide</INGR_ENG_NAME>
       * <INGR_NAME>클로르디아제폭시드</INGR_NAME>
       * <MIX_INGR/>
       * <ORI_INGR>[M088403]클로르디아제폭시드/[M223206]클로르디아제폭시드염산염</ORI_INGR>
       * <FORM_NAME/>
       * <NOTIFICATION_DATE>20150728</NOTIFICATION_DATE>
       * <PROHBT_CONTENT>노인에서의 장기지속형 벤조다이아제핀 사용은 운동실조, 과진정 등이 나타나기 쉬움으로 소량부터 신중투여 </PROHBT_CONTENT>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       */
      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        FORM_NAME?: string; // 제형
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        FORM_NAME: 'form',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
      };
    }
    export namespace DuplicateEffect {
      export interface Dto {
        dur_seq: string; // DUR_SEQ
        dur_type: string; // DUR유형
        mix_type: string; // 단일/복합
        dur_code: string; // DUR성분코드
        ingredient_eng_name: string; // DUR성분(영문)
        ingredient_kor_name: string; // DUR성분
        mix?: string; // 복합제
        effect_code: string; // 효능군
        related_ingredient: string; // 관계성분
        pharmacological_class: string; // 약효분류
        notification_date: string; // 고시일자
        prohibited_content?: string; // 금기내용
        remarks?: string; // 비고
        deletion_status: string; // 상태
        category?: string;
      }

      /**
       * ## EXAMPLE
       * <DUR_SEQ>2463</DUR_SEQ>
       * <TYPE_NAME>효능군중복</TYPE_NAME>
       * <MIX_TYPE>단일</MIX_TYPE>
       * <INGR_CODE>D000739</INGR_CODE>
       * <INGR_ENG_NAME>Aceclofenac</INGR_ENG_NAME>
       * <INGR_NAME>아세클로페낙</INGR_NAME>
       * <MIX_INGR/>
       * <ORI_INGR>[M040359]아세클로페낙</ORI_INGR>
       * <CLASS_NAME>[01140]해열.진통.소염제</CLASS_NAME>
       * <EFFECT_CODE>해열진통소염제</EFFECT_CODE>
       * <NOTIFICATION_DATE>20120831</NOTIFICATION_DATE>
       * <PROHBT_CONTENT/>
       * <REMARK/>
       * <DEL_YN>정상</DEL_YN>
       * <SERS_NAME>비스테로이드성 소염제</SERS_NAME>
       */
      export interface OpenApiDto {
        DUR_SEQ: string; // DUR_SEQ
        TYPE_NAME: string; // DUR유형
        MIX_TYPE: string; // 단일/복합
        INGR_CODE: string; // DUR성분코드
        INGR_ENG_NAME: string; // DUR성분(영문)
        INGR_NAME: string; // DUR성분
        MIX_INGR?: string; // 복합제
        ORI_INGR: string; // 관계성분
        CLASS_NAME: string; // 약효분류
        EFFECT_CODE: string; // 효능군
        NOTIFICATION_DATE: string; // 고시일자
        PROHBT_CONTENT?: string; // 금기내용
        REMARK?: string; // 비고
        DEL_YN: string; // 상태
        SERS_NAME?: string; // SERS_NAME
      }

      export type OpenApiResponseDto = OpenApiResponse<{ item: OpenApiDto }>;
      export type DtoKeys = keyof Dto;
      export type OpenApiDtoKeys = keyof OpenApiDto;
      export type KeyMap = Record<OpenApiDtoKeys, DtoKeys>;
      export const OPEN_API_DTO_KEY_MAP: KeyMap = {
        DUR_SEQ: 'dur_seq',
        TYPE_NAME: 'dur_type',
        MIX_TYPE: 'mix_type',
        INGR_CODE: 'dur_code',
        INGR_ENG_NAME: 'ingredient_eng_name',
        INGR_NAME: 'ingredient_kor_name',
        MIX_INGR: 'mix',
        ORI_INGR: 'related_ingredient',
        CLASS_NAME: 'pharmacological_class',
        EFFECT_CODE: 'effect_code',
        NOTIFICATION_DATE: 'notification_date',
        PROHBT_CONTENT: 'prohibited_content',
        REMARK: 'remarks',
        DEL_YN: 'deletion_status',
        SERS_NAME: 'category',
      };
    }
  }
}
