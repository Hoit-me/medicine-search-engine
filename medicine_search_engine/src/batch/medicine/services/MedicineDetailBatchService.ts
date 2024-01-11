import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { DETAIL_API_URL_BUILD } from '@src/constant';
import { of } from 'rxjs';

/**
 * ----------------------
 * MEDICINE DETAILS BATCH
 * ----------------------
 * 식품의약품안전처_의약품 제품 허가정보 중 허가목록 상세정보 배치
 *
 *
 *
 *
 */

@Injectable()
export class MedicineDetailBatchService {
  constructor(private readonly httpService: HttpService) {}

  // ----------------------
  // FETCH MEDICINE DETAILS
  // ----------------------
  fetchOpenApiDetailList$() {
    return of(DETAIL_API_URL_BUILD);
  }
}
