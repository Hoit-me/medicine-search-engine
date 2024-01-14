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

export namespace Medicine {
  // --------------------------------------
  // 1. 대한민국 의약품 제품허가 상세정보
  // - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?infoName=%EC%9D%98%EC%95%BD%ED%92%88&totalPages=4&limit=10&page=1&&openDataInfoSeq=12
  // - 매일 4시 업데이트
  // - 특이사항:
  //   - 효능효과, 용법용량, 주의사항, 첨부문서를 PDF 링크로 제공
  //   - 이미지가 없음
  //   - 사업자번호가 없음 - 해달 컬럼은 존재하나, 모든 값이 null
  // <download>
  // fileFormat: xls
  // url: https://nedrug.mfds.go.kr/cmn/xls/down/OpenData_ItemPermitDetail
  //
  export interface OpenApiDetailDTO {
    ITEM_NAME?: string; // 품목명
    ITEM_ENG_NAME?: string; // 품목 영문명
    ITEM_SEQ?: string; // 품목일련번호
    PERMIT_KIND_NAME?: string; // 허가/신고구분
    CANCEL_DATE?: string; // 취소 일자
    CANCEL_NAME?: string; // 상태
    CHANGE_DATE?: string; // 변경일자
    GBN_NAME?: string; // 변경이력

    ENTP_NAME?: string; // 업체명
    ENTP_ENG_NAME?: string; // 업체 영문명
    BIZRNO?: string; // 사업자번호
    ITEM_PERMIT_DATE?: string; // 허가일자
    ETC_OTC_CODE?: string; // 전문/일반구분 [전문의약품,일반의약품]

    CHART?: string; // 성상

    MATERIAL_NAME?: string; // 원료성분 // 총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 : ;총량 : 1000밀리리터|성분명 : 염화나트륨|분량 : 9|단위 : 그램|규격 : KP|성분정보 : |비고 :
    MAIN_INGR_ENG?: string; // 주성분 영문명  "Glucose/Sodium Chloride"
    BAR_CODE?: string; // 표준코드

    MAIN_ITEM_INGR?: string; // 주성분명  "[M040426]염화나트륨|[M040702]포도당"
    INGR_NAME?: string; // 첨가제  "[M040534]주사용수",

    ATC_CODE?: string; // ATC코드
    CNSGN_MANUF?: string; // 위탁제조업체

    STORAGE_METHOD?: string; // 저장방법
    VALID_TERM?: string; // 유효기간
    REEXAM_TARGET?: string; // 재심사대상
    REEXAM_DATE?: string; // 재심사기간

    PACK_UNIT?: string; // 포장단위
    EDI_CODE?: string; // 보험코드

    NARCOTIC_KIND_CODE?: string; // 마약종류코드
    NEWDRUG_CLASS_NAME?: string; //신약
    TOTAL_CONTENT?: string; // 총량

    MAKE_MATERIAL_FLAG?: string; //완제/원료구분
    ENTP_NO?: string; // 업체허가번호
    INDUTY_TYPE?: string; // 업종 구분

    DOC_TEXT?: string; // 첨부문서(전문)
    EE_DOC_ID?: string; // 효능효과 문서ID
    UD_DOC_ID?: string; // 용법용량 문서ID
    NB_DOC_ID?: string; // 주의사항(일반) 문서ID
    EE_DOC_DATA?: string; // 효능효과 문서 데이터
    UD_DOC_DATA?: string; // 용법용량 문서 데이터
    NB_DOC_DATA?: string; // 주의사항(일반) 문서 데이터
    PN_DOC_DATA?: string; // 첨부문서(전문) 문서 데이터
    INSERT_FILE?: string; // 첨부문서(전문) 문서ID
  }
  export interface Detail {
    name: string; // 품목명
    english_name: string | null; // "품목 영문명"
    serial_number: string; // 품목일련번호
    type: string; // "허가/신고구분"
    cancel_status: string; // 취소상태
    cancel_date: string | null; // 취소일자
    change_date: string | null; // 변경일자
    change_content: string | null; // 변경내용

    company: string; // 업체명
    english_company: string | null; // "업체 영문명"
    company_number: string | null; // 사업자번호
    permit_date: string | null; // 허가일자
    classification: string | null; // 전문일반

    state: string | null; // 성상

    ingredients: string | null; // 원료성분
    english_ingredients: string | null; // 영문성분명
    standard_code: string | null; // 표준코드 // 바코드 string -> string[]으로 변경

    main_ingredients: string | null; // 주성분명
    additive_ingredients: string | null; // 첨가제명

    atc_code: string | null; // ATC코드
    consignment_manufacture: string | null; // 위탁제조업체

    storage_method: string | null; // 저장방법
    expiration_date: string | null; // 유효기간
    re_examination: string | null; // 재심사대상
    re_examination_date: string | null; // 재심사기간

    packing_unit: string | null; // 포장단위
    insurance_code: string | null; // 보험코드

    narcotic_type: string | null; // 마약류분류
    is_new_drug: string | null; // 신약여부
    total_amount: string | null; // 총량

    raw_material: string; // 완제원료구분
    register_id: string; // 등록자ID
    industry_type: string | null; // 업종 구분

    document: string | null; // 첨부문서
    effect: string | null; // 효능효과
    usage: string | null; // 용법용량
    caution: string | null; // 주의사항
    effect_file_url: string | null; // 효능효과
    usage_file_url: string | null; // 용법용량
    caution_file_url: string | null; // 주의사항
    document_file_url: string | null; // 첨부문서
    insert_file_url: string | null; // 첨부문서
  }

  export type DetailKey = keyof Detail;

  export type Pharmacopoeia =
    | 'KP'
    | 'KCP'
    | 'KHP'
    | '별규'
    | 'USP'
    | 'NF'
    | 'JP'
    | 'EP'
    | 'BP'
    | 'DAB'
    | 'PF';

  export interface Ingredient {
    ko: string;
    en: string | null;
    pharmacopoeia: Pharmacopoeia;
    amount: string;
    standard: string;
    unit: string;
  }

  export interface Compound {
    code: string;
    name: string;
  }

  export interface ChangeContent {
    date: Date;
    content: string;
  }

  export interface ReExamination {
    type: string;
    re_examination_start_date: Date | null;
    re_examination_end_date: Date;
  }
  export type OpenAPiDetailResponse = OpenApiResponse<OpenApiDetailDTO>;

  export type OpenApiDetailKey = keyof OpenApiDetailDTO;
  export type OpenApiDetailToDetailKeyMap = Record<OpenApiDetailKey, DetailKey>;
  export const OPEN_API_DETAIL_TO_DETAIL_KEY_MAP: OpenApiDetailToDetailKeyMap =
    {
      ITEM_NAME: 'name',
      ITEM_ENG_NAME: 'english_name',
      ITEM_SEQ: 'serial_number',
      PERMIT_KIND_NAME: 'type',
      CANCEL_DATE: 'cancel_date',
      CANCEL_NAME: 'cancel_status',
      CHANGE_DATE: 'change_date',
      GBN_NAME: 'change_content',

      ENTP_NAME: 'company',
      ENTP_ENG_NAME: 'english_company',
      BIZRNO: 'company_number',
      ITEM_PERMIT_DATE: 'permit_date',
      ETC_OTC_CODE: 'classification',

      CHART: 'state',

      MATERIAL_NAME: 'ingredients',
      MAIN_INGR_ENG: 'english_ingredients',
      BAR_CODE: 'standard_code',

      MAIN_ITEM_INGR: 'main_ingredients',
      INGR_NAME: 'additive_ingredients',

      ATC_CODE: 'atc_code',
      CNSGN_MANUF: 'consignment_manufacture',

      STORAGE_METHOD: 'storage_method',
      VALID_TERM: 'expiration_date',
      REEXAM_TARGET: 're_examination',
      REEXAM_DATE: 're_examination_date',

      PACK_UNIT: 'packing_unit',
      EDI_CODE: 'insurance_code',

      NARCOTIC_KIND_CODE: 'narcotic_type',
      NEWDRUG_CLASS_NAME: 'is_new_drug',
      TOTAL_CONTENT: 'total_amount',

      MAKE_MATERIAL_FLAG: 'raw_material',
      ENTP_NO: 'register_id',
      INDUTY_TYPE: 'industry_type',

      DOC_TEXT: 'document',
      EE_DOC_ID: 'effect_file_url',
      UD_DOC_ID: 'usage_file_url',
      NB_DOC_ID: 'caution_file_url',
      EE_DOC_DATA: 'effect',
      UD_DOC_DATA: 'usage',
      NB_DOC_DATA: 'caution',
      PN_DOC_DATA: 'document',
      INSERT_FILE: 'insert_file_url',
    };

  export namespace XML {
    export type Paragraph = {
      '#text'?: string;
    };

    export type Article = {
      '@_title'?: string;
      PARAGRAPH: Paragraph[] | Paragraph;
    };

    export type Section = {
      ARTICLE: Article[] | Article;
      '@_title'?: string;
    };

    export type XML_DATA = {
      DOC: {
        SECTION: Section[] | Section;
        '@_title'?: string;
      };
    };
  }

  // --------------------------------------
  // 2. 대한민국 의약품 제품허가목록
  // - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?infoName=%EC%9D%98%EC%95%BD%ED%92%88&totalPages=4&limit=10&page=1&&openDataInfoSeq=7
  // - 매일 4시 업데이트
  // - 특이사항:
  //   - 이미지를 다운링크로 제공
  //      - 이미지가 변경될시, 다운로드 링크가 변경됨
  //      - 예시, 이소졸정
  //      - 201606230001604 (변경된 이미지)
  //      - 201606230001602 (변경전 이미지)
  //   - 품목허가번호 존재
  //   - 분류명 존재
  //   - 사업자번호 존재
  //   - 주성분수 존재
  //
  // 1에서 겹치는정보가 있기때문에, 이미지,사업자,분류명,주성분수 만 사용
  //
  // <download>
  // fileFormat: csv
  /**feilds
   * 품목일련번호
   * 품목명
   * 품목
   * 영문명
   * 업체명
   * 업체
   * 영문명
   * 업허가번호
   * 업일련번호
   * 업종
   * 전문일반구분
   * 주성분
   * 주성분수
   * 큰제품이미지
   * 신고허가구분
   * 취소/취하일자
   * 취소/취하구분
   * 분류명
   * 품목허가번호
   * 보험코드
   * 사업자번호
   */
  // --------------------------------------

  export interface OpenApiCommonDto {
    ITEM_SEQ: string;
    ITEM_NAME: string;
    ENTP_NAME: string;
    ITEM_PERMIT_DATE: string;
    INDUTY: string;
    PRDLST_STDR_CODE: string;
    SPCLTY_PBLC: string;
    PRDUCT_TYPE?: string;
    PRDUCT_PRMISN_NO: string;
    ITEM_INGR_NAME: string;
    ITEM_INGR_CNT: string;
    PERMIT_KIND_CODE: string;
    CANCEL_DATE: string;
    CANCEL_NAME: string;
    BIG_PRDT_IMG_URL: string;
    ENTP_SEQ: string;
    ENTP_NO: string;
    EDI_CODE: string;
    ITEM_ENG_NAME: string;
    ENTP_ENG_NAME: string;
  }
  export interface Common {
    serial_number: string; // 품목일련번호
    name: string; // 품목명
    pharmacological_class?: string; // 품목
    english_name: string; // 영문명
    company_name: string; // 업체명
    company_serial_number: string; // 업체
    company_english_name: string; // 업체영문명
    business_license_number: string; // 업허가번호
    business_serial_number: string; // 업일련번호
    business_type: string; // 업종
    professional_general_classification: string; // 전문일반구분
    main_ingredient: string; // 주성분
    number_of_main_ingredients: string; // 주성분수
    image?: string; // 큰제품이미지
    declaration_permission_classification: string; // 신고허가구분
    cancellation_withdrawal_date: string; // 취소취하일자
    cancellation_withdrawal_classification: string; // 취소취하구분
    classification_name: string; // 분류명
    item_approval_number: string; // 품목허가번호
    insurance_code: string; // 보험코드
    company_number: string; // 사업자번호
    permit_date: string; // 허가일자
    standard_code: string; // 표준코드
  }

  export type OpenApiCommonResponse = OpenApiResponse<OpenApiCommonDto>;
  export type OpenApiCommonKey = keyof OpenApiCommonDto;
  export type CommonKey = keyof Common;
  export type OpenApiCommonToCommonKeyMap = Record<OpenApiCommonKey, CommonKey>;
  export const OPEN_API_COMMON_TO_COMMON_KEY_MAP: OpenApiCommonToCommonKeyMap =
    {
      ITEM_SEQ: 'serial_number',
      ITEM_NAME: 'name',
      ENTP_NAME: 'company_name',
      ITEM_PERMIT_DATE: 'permit_date',
      INDUTY: 'business_type',
      PRDLST_STDR_CODE: 'serial_number',
      SPCLTY_PBLC: 'professional_general_classification',
      PRDUCT_TYPE: 'pharmacological_class',
      PRDUCT_PRMISN_NO: 'item_approval_number',
      ITEM_INGR_NAME: 'main_ingredient',
      ITEM_INGR_CNT: 'number_of_main_ingredients',
      PERMIT_KIND_CODE: 'declaration_permission_classification',
      CANCEL_DATE: 'cancellation_withdrawal_date',
      CANCEL_NAME: 'cancellation_withdrawal_classification',
      BIG_PRDT_IMG_URL: 'image',
      ENTP_SEQ: 'company_serial_number',
      ENTP_NO: 'company_number',
      EDI_CODE: 'insurance_code',
      ITEM_ENG_NAME: 'english_name',
      ENTP_ENG_NAME: 'company_english_name',
    };

  // --------------------------------------
  // 3. 의약품 낱알 식별 정보
  // - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?infoName=%EC%9D%98%EC%95%BD%ED%92%88&totalPages=4&limit=10&page=1&&openDataInfoSeq=11
  // - 매일 4시 업데이트
  // - 특이사항:
  /** feilds
   * 품목일련번호
   * 품목명
   * 업소일련번호
   * 업소명
   * 성상
   * 큰제품이미지
   * 표시앞
   * 표시뒤
   * 의약품제형
   * 색상앞
   * 색상뒤
   * 분할선앞
   * 분할선뒤
   * 크기장축
   * 크기단축
   * 크기두께
   * 이미지생성일자(약학정보원)
   * 분류번호
   * 분류명
   * 전문일반구분
   * 품목허가일자
   * 제형코드명
   * 표기내용앞
   * 표기내용뒤
   * 표기이미지앞
   * 표기이미지뒤
   * 표기코드앞
   * 표기코드뒤
   * 변경일자
   * 사업자번호
   */
  // --------------------------------------
  export interface PillJson_Kr {
    품목일련번호: string;
    품목명: string;
    업소일련번호: string;
    업소명: string;
    성상: string;
    큰제품이미지: string;
    표시앞: string;
    표시뒤: string;
    의약품제형: string;
    색상앞: string;
    색상뒤: string;
    분할선앞: string;
    분할선뒤: string;
    크기장축: string;
    크기단축: string;
    크기두께: string;
    이미지생성일자: string;
    분류번호: string;
    분류명: string;
    전문일반구분: string;
    품목허가일자: string;
    제형코드명: string;
    표기내용앞: string;
    표기내용뒤: string;
    표기이미지앞: string;
    표기이미지뒤: string;
    표기코드앞: string;
    표기코드뒤: string;
    변경일자: string;
    사업자번호: string;
  }

  // --------------------------------------
  // 99. 사용 고려
  // --------------------------------------
  /** e약은요정보
   * - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?totalPages=8&limit=10&page=4&&openDataInfoSeq=40
   *
   * feilds
   * 품목일련번호
   * 제품명
   * 업체명
   * 주성분
   * 이 약의 효능은 무엇입니까?
   * 이 약은 어떻게 사용합니까?
   * 이 약을 사용하기 전에 반드시 알아야 할 내용은 무엇입니가?
   * 이 약의 사용상 주의사항은 무엇입니까?
   * 이 약을 사용하는 동안 주의해야 할 약 또는 음식은 무엇입니까?
   * 이 약은 어떤 이상반응이 나타날 수 있습니까?
   * 이 약은 어떻게 보관해야 합니까?
   * 공개일자
   * 수정일자
   * 사업자번호
   */

  /** 의약외품_목록조회
   * - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?totalPages=8&limit=10&page=4&&openDataInfoSeq=34
   * feilds
   * 업소명	업소일련번호	품목명	분류번호	사업자번호	용법용량	품목일련번호	효능효과	주의사항	분류번호명	업체허가번호
   */

  /** 1일최대투여량 - 자세하지않음
   * - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?totalPages=8&limit=10&page=6&&openDataInfoSeq=61
   *
   * feilds
   * 성분코드	성분명(한글)	성분명(영문)	제형코드	제형명	투여경로	투여단위	1일최대투여량	사업자번호
   */
}
