import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

export class MedicineInsuranceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(insuranceCedes: string[], tx?: PrismaTxType) {
    return await (tx ?? this.prisma).medicine_insurance.findMany({
      where: {
        insurance_code: {
          in: insuranceCedes,
        },
      },
    });
  }
}
