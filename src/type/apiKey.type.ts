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
}
