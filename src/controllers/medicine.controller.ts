import { TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, UseInterceptors } from '@nestjs/common';
import { wrapResponse } from '@src/common/res/success';
import { MedicineError } from '@src/constant/error/medicine.error';
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
  @CacheTTL(60 * 60 * 24)
  async getMedicineList(
    @TypedQuery() query: Page.Search,
  ): Promise<SUCCESS<Page<Medicine.JoinInsurance<Medicine>>>> {
    const { search } = query;
    const result = search
      ? await this.medicineService.search({
          ...query,
          search,
          path: ['name'],
        })
      : await this.medicineService.getMedicineList(query);
    return wrapResponse(result);
  }

  @TypedRoute.Get('/keyword')
  async getMedicineKeyword(
    @TypedQuery() query: Page.Search,
  ): Promise<SUCCESS<string[]>> {
    const { search } = query;
    const result = await this.medicineService.getMedicineKeyword({
      ...query,
      search,
      path: 'name',
    });
    return wrapResponse(result);
  }

  @TypedRoute.Get('/:id')
  async getMedicineDetail(
    @TypedParam('id') id: string,
  ): Promise<
    SUCCESS<Medicine.DetailJoinInsuranceAndDUR> | MedicineError.NOT_FOUND
  > {
    const result = await this.medicineService.getMedicineDetail(id);
    return wrapResponse(result);
  }

  @TypedRoute.Get('/ingredient/:code')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60 * 60 * 24)
  async getMedicineByIngredient(
    @TypedParam('code') code: string,
    @TypedQuery() query: Page.Query,
  ): Promise<SUCCESS<Page<Medicine>>> {
    const result = await this.medicineService.getMedicineByIngredient(
      code,
      query,
    );
    return wrapResponse(result);
  }
}
