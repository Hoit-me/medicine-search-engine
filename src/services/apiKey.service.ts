import { Injectable } from '@nestjs/common';
import { api_key } from '@prisma/client';
import { ApiKeyError } from '@src/constant/error/apiKey.error';
import { ApiKeyRepository } from '@src/repository/apiKey.repository';
import { Either, left, right } from 'fp-ts/lib/Either';
import { ulid } from 'ulid';
import { ApiKeyUsageService } from './apiKeyUsage.service';

/**
 * ## 해당 내용은 issue로 이동될 예정입니다.
 *
 * API 키 정책
 *
 * - 사용자는 여러개의 API 키를 생성할 수 있습니다.
 * - API 키는 사용자의 식별자와 연결됩니다.
 * - API 키는 사용자가 생성하거나 삭제할 수 있습니다.
 *   - 삭제된 API 키는 사용할 수 없습니다.
 * - API 키는 사용자가 생성한 날짜와 시간을 기록합니다.
 *
 * API 키 사용 정책
 * - API 키 당 과금 정책을 적용할 수 있습니다.
 * - API 키를 사용한 정보를 저장합니다.
 *  - 저장 할 정보
 *    - IP
 *    - Method
 *    - endpoint
 *    - 응답 시간
 *    - 성공 여부
 *    - 사용한 시간
 *
 *
 * ### 고민거리
 * 1. 레디스 저장 시점
 *   - 실시간 저장: API 키 호출 시 실시간으로 레디스에 저장
 *      - 장점: 실시간 모니터링 및 비정상 사용감지가 비교적 용이
 *      - 단점: 빈번한 업데이트로 인한 레디스 부하 및 초기 느린조회 가능성
 *   - 사전 저장: 모든 API 키를 사전에 레디스에 저장
 *      - 장점: 구현이 비교적 쉬움, 첫 조회부터 빠른 속도 제공
 *      - 단점: 사용되지 않는 키도 메모리를 차지하며, 레디스 다운 시 정보 유실 위험이 존재
 *
 * 2. TTL 설정
 *   - 한달 (비교적 긴 TTL): 장기 데이터 분석 및 사용자 활성도 관리에 유리
 *      - 단점: 메모리 효율성 감소, DB 싱크시 대량 데이터 발생
 *   - 하루 (비교적 짧은 TTL): 메모리 효율성 증가, 데이터 신선도 증가, DB 부하 감소
 *      - 단점: 배치 처리 필요 및 일시적 데이터 유실 가능성
 *
 *
 * 3. DB 동기화 방법
 *   - 배치작업: 주기적으로 레디스에 저장된 데이터를 DB에 저장
 *   - PUB/SUB: 레디스에 저장된 데이터를 SUB하고 있는 서버에서 DB에 저장
 *
 *
 * ### 설계
 * 1. 저장 시점:
 *    - 실시간 저장 방식 채택이유:
 *      - 첫조회의 느린 속도는 DB 인덱스를 통해 어느정도 해결 가능
 *      - 비교적 메모리 사용량이 적으며, 레디스 다운 시 정보 유실 위험이 적음
 *
 * 2. TTL 설정:
 *    - 특정 날짜가 아닌, 해당 api의 limit횟수를 기준으로 TTL을 설정 (혹은 이전달의 사용량을 기준으로 TTL을 설정)
 *      - 이전달의 사용량이 많은 API키는 TTL을 길게 설정하여 메모리를 효율적으로 사용 할 수 있을 것으로 예상
 *         - TTL이 규칙적이지 않음으로 적절한 배치작업이 필요
 *
 *
 * 3. DB 동기화 방법:
 *   - 사용량관련 정보: 주기적인 배치작업을 통해 DB에 동기화
 *   - 사용로그: PUB/SUB을 통해 동기화
 *     ### 왜 사용로그는 PUB/SUB을 통해 동기화 하는가?
 *     - PUB/SUB의 경우 실패할경우 데이터가 유실될 가능성이 있지만, 유실되어도 위험성이 적다 판단. (고객의 손해가 아닌, 운영자의 손해)
 *     - redis가 다운되었을경우 PUB/SUB을 통해 구축된 실시간 정보(snapshot)를 이용하여 복구가 가능
 *     - 비교적 비정상 적인 행위 감지및, 실시간 이벤트를 캡처하여 대응이 가능
 *     - 로그 === 유저액션 이기에 다른 서비스에서도 사용이 될 가능성이 높다 판단.
 */
@Injectable()
export class ApiKeyService {
  constructor(
    private readonly apiKeyRepository: ApiKeyRepository,
    private readonly apiKeyUsageService: ApiKeyUsageService,
  ) {}

  /**
   * createApiKey
   *
   * 유저의 API 키를 생성합니다.
   */
  async createApiKey(user_id: string, name: string = 'default') {
    const key = this.generateApiKey();
    const newKey = await this.apiKeyRepository.create({ key, user_id, name });
    return newKey;
  }

  /**
   * getApiKeyList
   *
   * 유저의 API 키 목록을 조회합니다.
   * api키의 달 사용량을 조회합니다.
   */
  async getApiKeyList(user_id: string, date: Date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    return await this.apiKeyRepository.getList({ user_id, year, month });
  }

  /**
   * softDeleteApiKey
   *
   * 유저의 API 키를 삭제합니다.
   * 삭제된 API 키는 사용할 수 없습니다.
   */
  async softDeleteApiKey(
    user_id: string,
    key: string,
  ): Promise<Either<ApiKeyError.API_KEY_NOT_FOUND, true>> {
    const exist = await this.apiKeyRepository.getDetail(user_id, key);
    if (!exist) return left(ApiKeyError.API_KEY_NOT_FOUND);
    await this.apiKeyRepository.softDelete(user_id, key);
    return right(true);
  }

  async getApiKeyDetail(user_id: string, key: string) {
    const apiKey = await this.apiKeyRepository.getDetail(user_id, key);
    if (!apiKey) return left(ApiKeyError.API_KEY_NOT_FOUND);
    return right(apiKey);
  }

  async checkApiKey(key: string) {
    const apiKey = await this.apiKeyRepository.checkExist(key);
    if (!apiKey) return left(ApiKeyError.API_KEY_NOT_FOUND);
    return right(apiKey);
  }

  async setMonthlyUsage(api_key: api_key) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    await this.apiKeyUsageService.set({
      key: api_key.key,
      year,
      month,
      monthly_limit: api_key.default_limit,
    });
  }

  private generateApiKey() {
    return ulid();
  }
}
