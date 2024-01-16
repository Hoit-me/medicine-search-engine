import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { DurAgeTabooBatchService } from '../DUR/durAgeTabooBatch.service';
import { DurCombinedTabooBatchService } from '../DUR/durCombinedTabooBatch.service';
import { DurPregnantTabooBatchService } from '../DUR/durPregnantTabooBatch.service';
import { UtilProvider } from '../util.provider';
import { MedicineBatchController } from './medicineBatch.controller';
import { MedicineCommonBatchService } from './services/medicineCommonBatch.service';
import { MedicineDetailBatchService } from './services/medicineDetailBatch.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  controllers: [MedicineBatchController],
  providers: [
    MedicineDetailBatchService,
    MedicineCommonBatchService,
    DurCombinedTabooBatchService,
    DurAgeTabooBatchService,
    DurPregnantTabooBatchService,
    UtilProvider,
  ],
})
export class MedicineBatchModule {}
