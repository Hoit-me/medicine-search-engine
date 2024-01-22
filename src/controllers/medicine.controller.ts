import { TypedQuery, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { MedicineService } from '@src/services/medicine.service';
import { PageSearch } from '@src/type';
import { MedicineRes } from '@src/type/res/medicine';

@Controller('/medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}
  /**
   * test
   */
  @TypedRoute.Get('/')
  async getMedicineList(
    @TypedQuery() query: PageSearch,
  ): Promise<MedicineRes.Page> {
    const result = await this.medicineService.getMedicineList(query);
    return result;
  }
  /**
   * test1
   */
  @TypedRoute.Get('/search')
  async getMedicineList2(
    @TypedQuery() query: PageSearch,
  ): Promise<MedicineRes.Page> {
    const { search } = query;
    const result = search
      ? await this.medicineService.searchMedicine({
          ...query,
          search,
          path: ['name'],
        })
      : await this.medicineService.getMedicineList(query);
    return result;
  }
}
