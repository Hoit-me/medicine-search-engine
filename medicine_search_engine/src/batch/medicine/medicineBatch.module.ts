import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
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
  providers: [MedicineDetailBatchService, MedicineCommonBatchService],
})
export class MedicineBatchModule {}
