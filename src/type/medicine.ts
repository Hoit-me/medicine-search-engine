import {
  compound,
  dur_ingredient_age_taboo,
  dur_ingredient_combined_taboo,
  dur_ingredient_duplicate_effect_taboo,
  dur_ingredient_old_taboo,
  dur_ingredient_period_taboo,
  dur_ingredient_pregnant_taboo,
  dur_ingredient_volume_taboo,
  ingredients,
  medicine_insurance,
} from '@prisma/client';

/**
 * 현재는 다른 정보를 제공하지 않습니다.
 */
export interface Medicine {
  /**
   * 의약품 ID
   */
  id: string;
  /**
   * 의약품 이름
   */
  name: string;
  /**
   * 제조사
   */
  company: string;
  /**
   * 이미지 URL
   */
  image_url?: string | null;
  /**
   * 영문 이름
   */
  english_name: string | null;
  /**
   * 성분
   */
  ingredients: ingredients[];
  /**
   * 약효분류
   */
  pharmacological_class: { code: string; name: string }[];

  /**
   * 보험코드
   * @default []
   * @example ['1234', '5678']
   */
  insurance_code: string[];

  /**
   * 주성분
   */
  main_ingredients: compound[];
}
export namespace Medicine {
  export type JoinInsurance<T> = T & {
    /**
     * 보험 정보
     */
    insurance: medicine_insurance[];
  };

  export type JoinDUR<T> = T & {
    /**
     * 연령금기
     */
    age_dur: dur_ingredient_age_taboo[];

    /**
     * 병용금기
     */
    combined_dur: dur_ingredient_combined_taboo[];

    /**
     * 중복효능
     */
    duplicate_effect_dur: dur_ingredient_duplicate_effect_taboo[];

    /**
     * 노인금기
     */
    old_dur: dur_ingredient_old_taboo[];

    /**
     * 기간
     */
    period_dur: dur_ingredient_period_taboo[];

    /**
     * 임부금기
     */
    pregnant_dur: dur_ingredient_pregnant_taboo[];

    /**
     * 용량금기
     */
    volume_dur: dur_ingredient_volume_taboo[];
  };

  export interface Detail extends Medicine {
    /**
     * 효능
     */
    effect: string | null;
    /**
     * 주의사항
     */
    caution: string | null;
    /**
     * 복약방법
     */
    usage: string | null;

    /**
     * 저장방법
     */
    storage_method: string;

    /**
     * 도큐먼트
     */
    document: string | null;
  }

  export type DetailWithDUR = JoinDUR<Detail>;
  export type JoinInsuranceDetail = JoinInsurance<Detail>;
  export type DetailJoinInsuranceAndDUR = JoinInsurance<DetailWithDUR>;
}
