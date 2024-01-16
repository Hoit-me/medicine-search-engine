import { Controller, Get } from '@nestjs/common';
import { DurAgeTabooBatchService } from '../DUR/durAgeTabooBatch.service';
import { DurCombinedTabooBatchService } from '../DUR/durCombinedTabooBatch.service';
import { DurPregnantTabooBatchService } from '../DUR/durPregnantTabooBatch.service';
import { MedicineCommonBatchService } from './services/medicineCommonBatch.service';
import { MedicineDetailBatchService } from './services/medicineDetailBatch.service';

/**
 * # 약품 배치 - 테스트용 컨트롤러
 */
@Controller('/batch/medicine')
export class MedicineBatchController {
  constructor(
    private readonly medicineDetailBatchService: MedicineDetailBatchService,
    private readonly medicineCommonBatchService: MedicineCommonBatchService,
    private readonly durCombinedTabooBatchService: DurCombinedTabooBatchService,
    private readonly durAgeTabooBatchService: DurAgeTabooBatchService,
    private readonly durPregnantTabooBatchService: DurPregnantTabooBatchService,
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

    this.medicineDetailBatchService.batch('DESC').subscribe({
      complete: () => console.log('updateMedicine complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });

    return 'updateMedicine';
  }
  @Get('/update/image')
  async updateMedicineImage() {
    console.log('updateMedicineImage start');
    this.medicineCommonBatchService.batch().subscribe({
      complete: () => console.log('updateMedicineImage complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
      // next: (value) => console.log('subNext', value),
    });
    return 'updateMedicineImage';
  }

  @Get('/update/dur/combined')
  async updateDurCombined() {
    console.log('updateDurCombined start');
    this.durCombinedTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurCombined complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/dur/age')
  async updateDurAge() {
    console.log('updateDurAge start');
    this.durAgeTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurAge complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/dur/pregnant')
  async updateDurPregnant() {
    console.log('updateDurPregnant start');
    this.durPregnantTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurPregnant complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }
}
