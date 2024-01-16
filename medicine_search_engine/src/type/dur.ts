import { OpenApiResponse } from '.';

export namespace Dur {
  export namespace Ingredient {
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
        prohibited_content: string; // 금기내용
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
        PROHBT_CONTENT: string; // 금기내용
        REMARK: string; // 비고
        DEL_YN: string; // 상태
      }

      export type OpenApiResponseDto = OpenApiResponse<OpenApiDto>;

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
  }
}
