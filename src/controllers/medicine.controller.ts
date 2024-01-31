import { TypedQuery, TypedRoute } from '@nestia/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Controller, UseInterceptors } from '@nestjs/common';
import { generateResponse } from '@src/common/res/success';
import { MedicineService } from '@src/services/medicine.service';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { SUCCESS } from '@src/type/success';

@Controller('/medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  /**
   * 의약품 검색
   */
  @TypedRoute.Get('/')
  @UseInterceptors(CacheInterceptor)
  async getMedicineList(
    @TypedQuery() query: Page.Search,
  ): Promise<SUCCESS.Page<Medicine>> {
    const { search } = query;
    const result = search
      ? await this.medicineService.search({
          ...query,
          search,
          path: ['name'],
        })
      : await this.medicineService.getMedicineList(query);
    return generateResponse(result);
  }
}
