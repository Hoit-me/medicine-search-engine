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
  /**feilds
   * 품목명
   * 품목 영문명
   * 품목일련번호
   * 허가/신고구분
   * 취소상태
   * 취소일자
   * 변경일자
   * 업체명
   * 업체 영문명
   * 허가일자
   * 전문일반
   * 성상
   * 표준코드
   * 원료성분
   * 영문성분명
   * 효능효과
   * 용법용량
   * 주의사항
   * 첨부문서
   * 저장방법
   * 유효기간
   * 재심사대상
   * 재심사기간
   * 포장단위
   * 보험코드
   * 마약류분류
   * 완제원료구분
   * 신약여부
   * 변경내용
   * 총량
   * 주성분명
   * 첨가제명
   * ATC코드
   * 등록자ID
   * 사업자번호
   */
  // --------------------------------------
  export interface DetailJson_Kr {
    품목명: string;
    '품목 영문명'?: string;
    품목일련번호: string;
    '허가/신고구분': string;
    취소상태: string;
    취소일자?: string;
    변경일자?: string;
    업체명: string;
    '업체 영문명'?: string;
    허가일자?: string;
    전문일반?: string;
    성상?: string;
    표준코드?: string;
    원료성분?: string;
    영문성분명?: string;
    효능효과?: string;
    용법용량?: string;
    주의사항?: string;
    첨부문서?: string;
    저장방법?: string;
    유효기간?: string;
    재심사대상?: string;
    재심사기간?: string;
    포장단위?: string;
    보험코드?: string;
    마약류분류?: string;
    완제원료구분: string;
    신약여부?: string;
    변경내용?: string;
    총량?: string;
    주성분명?: string;
    첨가제명?: string;
    ATC코드?: string;
    등록자ID: string;
    사업자번호?: string;
  }

  export interface Detail {
    name: string; // 품목명
    english_name?: string; // "품목 영문명"
    serial_number: string; // 품목일련번호
    type: string; // "허가/신고구분"
    cancel_status: string; // 취소상태
    cancel_date?: string; // 취소일자
    change_date?: string; // 변경일자
    company: string; // 업체명
    english_company?: string; // "업체 영문명"
    permit_date?: string; // 허가일자
    classification?: string; // 전문일반
    state?: string; // 성상
    standard_code?: string; // 표준코드
    ingredients?: string; // 원료성분
    english_ingredients?: string; // 영문성분명
    effect?: string; // 효능효과
    usage?: string; // 용법용량
    caution?: string; // 주의사항
    document?: string; // 첨부문서
    storage_method?: string; // 저장방법
    expiration_date?: string; // 유효기간
    re_examination?: string; // 재심사대상
    re_examination_date?: string; // 재심사기간
    packing_unit?: string; // 포장단위
    insurance_code?: string; // 보험코드
    narcotic_type?: string; // 마약류분류
    raw_material: string; // 완제원료구분
    is_new_drug?: string; // 신약여부
    change_content?: string; // 변경내용
    total_amount?: string; // 총량
    main_ingredient?: string; // 주성분명
    additive?: string; // 첨가제명
    atc_code?: string; // ATC코드
    register_id: string; // 등록자ID
    company_number?: string; // 사업자번호
  }

  type KorKey = keyof DetailJson_Kr;
  type EngKey = keyof Detail;
  type KorToEngKeyMap = Record<KorKey, EngKey>;
  export const KOR_TO_ENG_KEY_MAP: KorToEngKeyMap = {
    품목명: 'name',
    '품목 영문명': 'english_name',
    품목일련번호: 'serial_number',
    '허가/신고구분': 'type',
    취소상태: 'cancel_status',
    취소일자: 'cancel_date',
    변경일자: 'change_date',
    업체명: 'company',
    '업체 영문명': 'english_company',
    허가일자: 'permit_date',
    전문일반: 'classification',
    성상: 'state',
    표준코드: 'standard_code',
    원료성분: 'ingredients',
    영문성분명: 'english_ingredients',
    효능효과: 'effect',
    용법용량: 'usage',
    주의사항: 'caution',
    첨부문서: 'document',
    저장방법: 'storage_method',
    유효기간: 'expiration_date',
    재심사대상: 're_examination',
    재심사기간: 're_examination_date',
    포장단위: 'packing_unit',
    보험코드: 'insurance_code',
    마약류분류: 'narcotic_type',
    완제원료구분: 'raw_material',
    신약여부: 'is_new_drug',
    변경내용: 'change_content',
    총량: 'total_amount',
    주성분명: 'main_ingredient',
    첨가제명: 'additive',
    ATC코드: 'atc_code',
    등록자ID: 'register_id',
    사업자번호: 'company_number',
  };

  export type Pharmacoepia =
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
    | 'PF'
    | null;
  export interface Ingredient {
    ko: string | null;
    en: string | null;
    pharmacopeia: Pharmacoepia;
    amount: string | null;
    standard: string | null;
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
    re_examination_start_date: Date;
    re_examination_end_date: Date;
  }

  // --------------------------------------
  // 2. 대한민국 의약품 제품허가목록
  // - url: https://nedrug.mfds.go.kr/pbp/CCBGA01/getItem?infoName=%EC%9D%98%EC%95%BD%ED%92%88&totalPages=4&limit=10&page=1&&openDataInfoSeq=7
  // - 매일 4시 업데이트
  // - 특이사항:
  //   - 이미지를 다운링크로 제공
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
  export interface CommonJson_Kr {
    품목일련번호: string;
    품목명: string;
    품목: string;
    영문명: string;
    업체명: string;
    업체: string;
    업체영문명: string;
    업허가번호: string;
    업일련번호: string;
    업종: string;
    전문일반구분: string;
    주성분: string;
    주성분수: string;
    큰제품이미지: string;
    신고허가구분: string;
    취소취하일자: string;
    취소취하구분: string;
    분류명: string;
    품목허가번호: string;
    보험코드: string;
    사업자번호: string;
  }

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
