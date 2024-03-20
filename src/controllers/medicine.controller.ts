import { TypedParam, TypedQuery, TypedRoute } from '@nestia/core';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Controller, UseInterceptors } from '@nestjs/common';
import { eitherToResponse, wrapResponse } from '@src/common/res/success';
import { MedicineError } from '@src/constant/error/medicine.error';
import { MedicineService } from '@src/services/medicine.service';
import { Medicine } from '@src/type/medicine.type';
import { Page } from '@src/type/page';
import { SUCCESS } from '@src/type/success';

/**
 * Medicine Controller
 *
 * read only
 */
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
    @TypedQuery()
    query: Page.Search & {
      mode?: 'medicine' | 'ingredient';
      language?: 'ko' | 'en';
    },
  ): Promise<SUCCESS<Page<Medicine.JoinInsurance<Medicine>>>> {
    const { search, mode, language } = query;

    // 분리필요
    const generatePath = (
      mode: 'medicine' | 'ingredient' = 'medicine',
      language: 'ko' | 'en' = 'ko',
    ): ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[] => {
      if (mode === 'medicine') {
        return language === 'ko' ? ['name'] : ['english_name'];
      }
      return language === 'ko' ? ['ingredients.ko'] : ['ingredients.en'];
    };
    const result = search
      ? await this.medicineService.search({
          ...query,
          search,
          path: generatePath(mode, language),
        })
      : await this.medicineService.getMedicineList(query);
    return wrapResponse(result);
  }

  @TypedRoute.Get('/keyword')
  async getMedicineKeyword(
    @TypedQuery()
    query: Page.Search & {
      search: string;
      language?: 'ko' | 'en';
    },
  ): Promise<SUCCESS<string[]>> {
    const { search, language = 'ko' } = query;
    const result = await this.medicineService.getMedicineKeyword({
      ...query,
      search,
      path: language === 'ko' ? 'name' : 'english_name',
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
    return eitherToResponse(result);
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
