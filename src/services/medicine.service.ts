import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { MedicineError } from '@src/constant/error/medicine.error';
import { MedicineRepository } from '@src/repository/medicine.repository';
import { MedicineInsuranceRepository } from '@src/repository/medicineInsurance.repository';
import { Medicine } from '@src/type/medicine';
import { Page } from '@src/type/page';
import { DurRepository } from './../repository/dur.repository';
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
    private readonly medicineInsuranceRepository: MedicineInsuranceRepository,
    private readonly durRepository: DurRepository,
  ) {}

  // Before Refactoring
  /**
   * 문제
   * - 보험 정보를 가져오는 로직이 해당 보험정보개수 만큼 호출되어야 함
   * - DB 호출이 많아질수록 성능이 저하됨
   *
   * 성능 측정
   * page:10, limit:10
   * - 평균 0.5초 ~ 1초
   */
  async joinInsurance_Before(medicine: Medicine, tx?: PrismaTxType) {
    const insurance = medicine.insurance_code;
    const insuranceList = await this.medicineInsuranceRepository.findMany(
      insurance,
      tx,
    );
    return {
      ...medicine,
      insurance: insuranceList,
    };
  }

  // After Refactoring
  /**
   * 해결
   * - 보험 정보를 한번에 가져와서 join
   * - DB 호출을 최소화하여 성능을 향상
   *
   * 성능 측정
   * page:10, limit:10
   * - 평균 0.3초 이하
   */
  async joinInsurance(medicines: Medicine[], tx?: PrismaTxType) {
    const insurance = medicines
      .map((medicine) => medicine.insurance_code)
      .flat();
    const insuranceList = await this.medicineInsuranceRepository.findMany(
      insurance,
      tx,
    );
    const result = medicines.map((medicine) => {
      const insuranceCodes = medicine.insurance_code;
      const insurance = insuranceList.filter((item) =>
        insuranceCodes.includes(item.insurance_code),
      );
      return {
        ...medicine,
        insurance,
      };
    });
    return result;
  }

  async getMedicineList({
    page = 1,
    limit = 10,
  }: Page.Search): Promise<Page<Medicine.JoinInsurance<Medicine>>> {
    return await this.prisma.$transaction(async (tx) => {
      const data = await this.medicineRepository.findMany({ page, limit }, tx);
      const count = await this.medicineRepository.count(tx);
      // const medicineJoinInsurance = await Promise.all(
      //   data.map((medicine) => this.joinInsurance_Before(medicine, tx)),
      // );
      const medicineJoinInsurance = await this.joinInsurance(data, tx);
      return {
        data: medicineJoinInsurance,
        pagenation: {
          current: page,
          limit,
          total_count: count,
          total_page: Math.ceil(count / limit),
        },
      };
    });
  }
  async search({
    page = 1,
    limit = 10,
    search = '',
    path = ['name'],
  }: Page.Search & {
    path: ('name' | 'english_name' | 'ingredients.ko' | 'ingredients.en')[];
  }): Promise<Page<Medicine.JoinInsurance<Medicine>>> {
    const arg = { page, limit, search, path };
    const editCount = search.length > 6 ? 2 : search.length > 3 ? 1 : 0;
    const searchOption = editCount
      ? {
          fuzzy: {
            maxEdits: editCount,
          },
        }
      : undefined;

    const medicines = await this.medicineRepository.aggregateSearch(
      arg,
      searchOption,
    );
    const count = await this.medicineRepository.aggregateSearchCount(
      arg,
      searchOption,
    );

    const data = await this.prisma.$transaction(async (tx) => {
      const medicineJoinInsurance = await this.joinInsurance(medicines, tx);
      return medicineJoinInsurance;
    });

    return {
      data,
      pagenation: {
        current: page,
        limit,
        total_count: count,
        total_page: Math.ceil(count / limit),
      },
    };
  }

  async getMedicineKeyword({
    page = 1,
    limit = 10,
    search = '',
    path = 'name',
  }: Page.Search & {
    path: 'name' | 'english_name';
  }): Promise<string[]> {
    const arg = { page, limit, search, path };
    return (await this.medicineRepository.aggregateKeyword(arg)).map(
      (item) => item.keyword,
    );
  }

  async getMedicineDetail(
    id: string,
  ): Promise<Medicine.DetailJoinInsuranceAndDUR | MedicineError.NOT_FOUND> {
    const result = await this.prisma.$transaction(async (tx) => {
      const medicine = await this.medicineRepository.findUniqueDetail(id, tx);
      if (!medicine) {
        return MedicineError.NOT_FOUND;
      }
      const insurance = medicine.insurance_code;
      const insuranceList = await this.medicineInsuranceRepository.findMany(
        insurance,
        tx,
      );
      const ingredientCodes = medicine.main_ingredients.map(
        (item) => item.code,
      );
      const dur = await this.durRepository.findManyDurTaboo(
        ingredientCodes,
        tx,
      );

      return {
        ...medicine,
        ...dur,
        insurance: insuranceList,
      };
    });
    return result;
  }

  async getMedicineByIngredient(
    code: string,
    { page = 1, limit = 10 }: Page.Query,
  ): Promise<Page<Medicine>> {
    return await this.prisma.$transaction(async (tx) => {
      const data = await this.medicineRepository.findManyByIntegredientCode(
        code,
        { page, limit },
        tx,
      );
      const count = await this.medicineRepository.countByIntegredientCode(
        code,
        tx,
      );

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
}
