import { Controller, Get } from '@nestjs/common';
import { MedicineBatchService } from './medicineBatch.service';
@Controller('/batch/medicine')
export class MedicineBatchController {
  constructor(private readonly medicineBatchService: MedicineBatchService) {}

  @Get('/update')
  async updateMedicine() {
    console.log('updateMedicine start');
    // this.medicineBatchService.detailBatch().subscribe({
    //   complete: () => console.log('updateMedicine'),
    //   error: (error) => console.log('subErro', error.message, error.stack),
    //   next: (value) =>
    //     console.log('subNext', value.id, value.name, value.effect),
    // });

    this.medicineBatchService.batch().subscribe({
      complete: () => console.log('updateMedicine complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
      // next: (value) => console.log('subNext', value),
    });

    return 'updateMedicine';
  }
  @Get('/update/image')
  async updateMedicineImage() {
    console.log('updateMedicineImage start');
    this.medicineBatchService.batchCommon().subscribe({
      complete: () => console.log('updateMedicineImage complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
      // next: (value) => console.log('subNext', value),
    });
    return 'updateMedicineImage';
  }
}
