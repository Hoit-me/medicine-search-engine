import { Controller, Get } from '@nestjs/common';
import { DurAgeTabooBatchService } from '../DUR/durAgeTabooBatch.service';
import { DurCombinedTabooBatchService } from '../DUR/durCombinedTabooBatch.service';
import { DurDuplicateEffectTabooBatchService } from '../DUR/durDuplicateEffectTabooBatch.service';
import { DurOldTabooBatchService } from '../DUR/durOldTabooBatch.service';
import { DurPeriodTabooBatchService } from '../DUR/durPeriodTabooBatch.service';
import { DurPregnantTabooBatchService } from '../DUR/durPregnantTabooBatch.service';
import { DurVolumeTabooBatchService } from '../DUR/durVolumeTabooBatch.service';
import { DiseaseBatchService } from '../disease/diseaseBatch.service';
import { InsuranceBatchService } from '../insurance/insuranceBatch.Service';
import { MedicineCommonBatchService } from './services/medicineCommonBatch.service';
import { MedicineDetailBatchService } from './services/medicineDetailBatch.service';
import { MedicineIdentificationBatchService } from './services/medicineIdentificationBatch.service';
import { MedicineIngredientBatchService } from './services/medicineIngredient.service';

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
    private readonly durVolumeTabooBatchService: DurVolumeTabooBatchService,
    private readonly durPeriodTabooBatchService: DurPeriodTabooBatchService,
    private readonly durOldTabooBatchService: DurOldTabooBatchService,
    private readonly durDuplicateEffectTabooBatchService: DurDuplicateEffectTabooBatchService,
    private readonly insuranceBatchService: InsuranceBatchService,
    private readonly medicineIdentificationBatchService: MedicineIdentificationBatchService,
    private readonly medicineIngredientBatchService: MedicineIngredientBatchService,
    private readonly diseaseBatchService: DiseaseBatchService,
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

  @Get('/update/dur/volume')
  async updateDurVolume() {
    console.log('updateDurVolume start');
    this.durVolumeTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurVolume complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/dur/period')
  async updateDurPeriod() {
    console.log('updateDurPeriod start');
    this.durPeriodTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurPeriod complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/dur/old')
  async updateDurOld() {
    console.log('updateDurOld start');
    this.durOldTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurOld complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/dur/duplicate-effect')
  async updateDurDuplicateEffect() {
    console.log('updateDurDuplicateEffect start');
    this.durDuplicateEffectTabooBatchService.batch$().subscribe({
      complete: () => console.log('updateDurDuplicateEffect complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/insurance')
  async updateInsurance() {
    console.log('updateInsurance start');
    this.insuranceBatchService.batch$().subscribe({
      complete: () => console.log('updateInsurance complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/identification')
  async updateIdentification() {
    console.log('updateIdentification start');
    this.medicineIdentificationBatchService.batch$().subscribe({
      complete: () => console.log('updateIdentification complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/medicine/ingredient')
  async updateMedicineIngredient() {
    console.log('updateMedicineIngredient start');
    this.medicineIngredientBatchService.batch$().subscribe({
      complete: () => console.log('updateMedicineIngredient complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }

  @Get('/update/disease')
  async updateDisease() {
    console.log('updateDisease start');
    this.diseaseBatchService.batch$().subscribe({
      complete: () => console.log('updateDisease complete'),
      error: (error) => console.log('subErro', error.message, error.stack),
    });
  }
}
