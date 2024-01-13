import { Controller, Get } from '@nestjs/common';
import { MedicineDetailBatchService } from './services/medicineDetailBatch.service';
@Controller('/batch/medicine')
export class MedicineBatchController {
  constructor(
    private readonly medicineDetailBatchService: MedicineDetailBatchService,
  ) {}

  @Get('/update')
  async updateMedicine() {
    console.log('updateMedicine start');
    // this.medicineBatchService.detailBatch().subscribe({
    //   complete: () => console.log('updateMedicine'),
    //   error: (error) => console.log('subErro', error.message, error.stack),
    //   next: (value) =>
    //     console.log('subNext', value.id, value.name, value.effect),
    // });

    this.medicineDetailBatchService.batch().subscribe({
      complete: () => console.log('updateMedicine complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });

    return 'updateMedicine';
  }
  // @Get('/update/image')
  // async updateMedicineImage() {
  //   console.log('updateMedicineImage start');
  //   this.medicineBatchService.batchCommon().subscribe({
  //     complete: () => console.log('updateMedicineImage complete'),
  //     error: (error) => console.log('subErro', error.message, error.stack),
  //     // next: (value) => console.log('subNext', value),
  //   });
  //   return 'updateMedicineImage';
  // }
}
