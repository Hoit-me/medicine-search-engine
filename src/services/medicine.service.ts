import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { MedicineRepository } from '@src/repository/medicine.repository';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
/**
 * MEDICINE
 *
 * 1. 의약품 특성상 조회만 가능하도록 구현
 */
@Injectable()
export class MedicineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly medicineRepository: MedicineRepository,
  ) {}

  async getMedicineList({
    page = 1,
    limit = 10,
  }: Page.Search): Promise<Page<Medicine>> {
    return await this.prisma.$transaction(async (tx) => {
      const data = await this.medicineRepository.findMany({ page, limit }, tx);
      const count = await this.medicineRepository.count(tx);
      return {
        data,
        pagenation: {
          current: page,
          limit,
          total_count: count,
          total_page: Math.ceil(count / limit),
        },
      };
    });
  }

  async getMedicineInsuranceList(insuranceCedes: string[]) {
    const medicineList = await this.prisma.medicine_insurance.findMany({
      where: {
        insurance_code: {
          in: insuranceCedes,
        },
      },
    });
    return medicineList;
  }

  async search({
    page = 1,
    limit = 10,
    search = '',
    path = ['name'],
  }: Page.Search & {
    path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
  }): Promise<Page<Medicine>> {
    const arg = { page, limit, search, path };
    const editCount = search.length > 6 ? 2 : search.length > 3 ? 1 : 0;
    const searchOption = editCount
      ? {
          fuzzy: {
            maxEdits: editCount,
          },
        }
      : undefined;

    const data = await this.medicineRepository.aggregateSearch(
      arg,
      searchOption,
    );
    const count = await this.medicineRepository.aggregateSearchCount(
      arg,
      searchOption,
    );

    return {
      data: data,
      pagenation: {
        current: page,
        limit,
        total_count: count,
        total_page: Math.ceil(count / limit),
      },
    };
  }
}
