import { Module } from '@nestjs/common';
import { MedicineController } from '@src/controllers/medicine.controller';
import { MedicineRepository } from '@src/repository/medicine.repository';
import { MedicineInsuranceRepository } from '@src/repository/medicineInsurance.repository';
import { MedicineService } from '@src/services/medicine.service';

@Module({
  controllers: [MedicineController],
  providers: [MedicineService, MedicineRepository, MedicineInsuranceRepository],
})
export class MedicineModule {}
