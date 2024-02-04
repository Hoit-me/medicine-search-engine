import { ingredients, medicine_insurance } from '@prisma/client';

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
  insurance: medicine_insurance[];
}
export namespace Medicine {}
