import { TypedQuery, TypedRoute } from '@nestia/core';
import { Controller } from '@nestjs/common';
import { MedicineService } from '@src/services/medicine.service';
import { MedicineRes } from '@src/type/res/medicine';

@Controller('/medicine')
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}
  @TypedRoute.Get('/')
  async getMedicineList(
    @TypedQuery() query: { page: number; limit: number; search?: string },
  ): Promise<MedicineRes.Page> {
    const result = await this.medicineService.getMedicineList(query);
    return result;
  }
}
