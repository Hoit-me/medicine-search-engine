import { Module } from '@nestjs/common';
import { MedicineController } from '@src/controllers/medicine.controller';
import { MedicineService } from '@src/services/medicine.service';

@Module({
  controllers: [MedicineController],
  providers: [MedicineService],
})
export class MedicineModule {}
