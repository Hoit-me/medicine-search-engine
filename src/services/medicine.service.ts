import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { MedicineRepository } from '@src/repository/medicine.repository';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { SelectAll } from '@src/utils/excludeField';
import typia from 'typia';
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

  transeformPage(
    input: Prisma.medicineGetPayload<ReturnType<typeof this.selectPage>>,
  ) {
    return input;
  }

  selectPage() {
    return {
      select: {
        ...typia.random<SelectAll<Medicine, true>>(),
      },
    } satisfies Prisma.medicineFindManyArgs;
  }

  // -------------------------
  // READ
  // -------------------------
  /**
   * 성능 기록
   * - 환경
   *  - 16GB RAM
   *  - mac M1 Pro
   *
   * - DB
   *  - mongodb altas
   *
   * ### no index [name]
   * - 검색어 X
   *  - 100ms ~ 400ms
   *
   * - 검색어 O
   *   - 검색어 : '졸정'
   *   - 600ms ~ 800ms
   *
   * ### index [name]
   * - 검색어 X
   *
   */
  async getMedicineList({
    page = 1,
    limit = 10,
    search = '',
  }: Page.Search): Promise<Page<Medicine>> {
    const medicineList = await this.prisma.medicine.findMany({
      ...this.selectPage(),
      skip: (page - 1) * limit,
      take: limit,
      ...(search && {
        where: {
          name: {
            contains: search,
          },
        },
      }),
    });

    const totalCount = await this.prisma.medicine.count({
      ...(search && {
        where: {
          name: {
            contains: search,
          },
        },
      }),
    });

    return {
      data: medicineList.map(this.transeformPage),
      pagenation: {
        current: page,
        limit,
        total_count: totalCount,
        total_page: Math.ceil(totalCount / limit),
      },
    };
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

  /**
   * 성능 기록
   *
   * - 환경
   *
   */
  async search({
    page = 1,
    limit = 10,
    search = '',
    path = ['name'],
  }: Page.Search & {
    path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
  }): Promise<Page<Medicine>> {
    const result = await this.medicineRepository.aggregateSearch(
      {
        page,
        limit,
        search,
        path,
      },
      {
        fuzzy: {
          maxEdits: 1,
        },
      },
    );

    return result;
  }
}
