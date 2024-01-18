import { Injectable } from '@nestjs/common';
import { UtilProvider } from '@src/batch/util.provider';
import { PrismaService } from '@src/common/prisma/prisma.service';

@Injectable()
export class MedicineIdentificationBatchService {
  constructor(
    private readonly util: UtilProvider,
    private readonly prisma: PrismaService,
  ) {}

  batch() {
    console.log('MedicineIdentificationBatchService');
  }
}
