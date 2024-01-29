import { TypedQuery, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { generateResponse } from '@src/common/res/success';
import { MedicineService } from '@src/services/medicine.service';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { SUCCESS } from '@src/type/success';

@Controller('/medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}
  /**
   * 성능 테스트용 API 입니다.
   *
   * 해당 API는 search engine을 사용하지 않고, DB에서 검색을 진행합니다.
   */
  @TypedRoute.Get('/')
  async getMedicineList(
    @TypedQuery() query: Page.Search,
  ): Promise<SUCCESS.Page<Medicine>> {
    const result = await this.medicineService.getMedicineList(query);
    return generateResponse(result);
  }
  /**
   * 성능 테스트용 API 입니다.
   *
   * 해당 API는 search engine을 사용하여 검색을 진행합니다.
   */
  @TypedRoute.Get('/search')
  async getMedicineList2(
    @TypedQuery() query: Page.Search,
  ): Promise<SUCCESS.Page<Medicine>> {
    const { search } = query;
    const result = await this.medicineService.search({
      ...query,
      search,
      path: ['name'],
    });
    return generateResponse(result);
  }
}
