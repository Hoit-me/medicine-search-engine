import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma, medicine } from '@prisma/client';
import { MedicineCommonBatchService } from '@src/batch/medicine/services/medicineCommonBatch.service';
import { UtilProvider } from '@src/batch/util.provider';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { Medicine } from '@src/type/medicine';
import { mockDeep } from 'jest-mock-extended';
import { of } from 'rxjs';
import typia, { tags } from 'typia';
import { S3Service } from './../../../../common/aws/s3/s3.service';

describe('MedicineCommonBatchService', () => {
  let medicineCommonBatchService: MedicineCommonBatchService;
  // let httpService: HttpService;
  let s3Service: S3Service;
  let prismaService: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule.register({ timeout: 5000 })],
      providers: [
        MedicineCommonBatchService,
        PrismaService,
        { provide: HttpService, useValue: new HttpService() },
        S3Service,
        UtilProvider,
      ],
    })
      .overrideProvider(HttpService)
      .useValue(mockDeep<HttpService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    medicineCommonBatchService = module.get<MedicineCommonBatchService>(
      MedicineCommonBatchService,
    );
    // httpService = module.get<HttpService>(HttpService);
    s3Service = module.get<S3Service>(S3Service);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('bulkCechExistMedicine', () => {
    // arrange
    const medicineCommonList = typia.random<
      Medicine.Common.Dto[] & tags.MaxItems<10> & tags.MinItems<10>
    >();

    const findManyOutput = medicineCommonList.map((medicine) => {
      const { serial_number } = medicine;
      const output = typia.random<medicine>();
      return {
        ...output,
        id: serial_number,
      };
    });
    beforeEach(() => {
      prismaService.medicine.findMany = jest
        .fn()
        .mockResolvedValue(findManyOutput);
    });

    it('medicineCommonList를 입력하면, 존재하는 Medicine을 반환한다.', async () => {
      // act
      const result =
        await medicineCommonBatchService.bulkCheckExistMedicine(
          medicineCommonList,
        );

      // assert
      expect(result.length).toBe(medicineCommonList.length);
    });

    it('medicineCommonList를 입력하면, 존재하는 Medicine을 반환한다.', async () => {
      // arrange
      const medicineCommonListSilce = medicineCommonList.slice(0, 5);

      // act
      const result = await medicineCommonBatchService.bulkCheckExistMedicine(
        medicineCommonListSilce,
      );

      // assert
      expect(result.length).toBe(medicineCommonListSilce.length);
    });

    it('DB에 존재하지 않는 Medicine을 입력하면, 빈 배열을 반환한다.', async () => {
      // arrange
      const medicineCommonListSilce = medicineCommonList.slice(0, 5);
      prismaService.medicine.findMany = jest.fn().mockResolvedValue([]);

      // act
      const result = await medicineCommonBatchService.bulkCheckExistMedicine(
        medicineCommonListSilce,
      );

      // assert
      expect(result.length).toBe(0);
    });

    it('DB에 존재하지 않는 Medicine을 입력하면, 빈 배열을 반환한다.', async () => {
      // arrange
      const medicineCommonListSilce = medicineCommonList.slice(0, 5);
      prismaService.medicine.findMany = jest.fn().mockResolvedValue([]);

      // act
      const result = await medicineCommonBatchService.bulkCheckExistMedicine(
        medicineCommonListSilce,
      );

      // assert
      expect(result.length).toBe(0);
    });

    it('DB에 존재하는 Medicine만 반환한다.', async () => {
      // arrange
      const medicineCommonListSilce = medicineCommonList.slice(0, 5);
      prismaService.medicine.findMany = jest
        .fn()
        .mockResolvedValue(findManyOutput.slice(0, 3));

      // act
      const result = await medicineCommonBatchService.bulkCheckExistMedicine(
        medicineCommonListSilce,
      );

      // assert
      expect(result.length).toBe(3);
    });
  });

  describe('checkImageUpdated$', () => {
    const before: medicine = {
      ...typia.random<medicine>(),
      image_url: 'before',
    };
    const updatedCommon: Medicine.Common.Dto = {
      ...typia.random<Medicine.Common.Dto>(),
      serial_number: before.id,
      image: 'updated',
    };
    const noneUpdatedCommon: Medicine.Common.Dto = {
      ...typia.random<Medicine.Common.Dto>(),
      serial_number: before.id,
      image: 'before',
    };

    it('이미지가 업데이트 되었으면, updated true를 반환한다.', () => {
      // arrange
      const expected = true;

      // act
      const result = medicineCommonBatchService.checkImageUpdated$({
        before,
        common: updatedCommon,
      });

      // assert
      expect(result.updated).toBe(expected);
      expect(result.common).toBe(updatedCommon);
    });

    it('이미지가 업데이트 되지 않았으면, updated false를 반환한다.', () => {
      // arrange
      const expected = false;

      // act
      const result = medicineCommonBatchService.checkImageUpdated$({
        before,
        common: noneUpdatedCommon,
      });

      // assert
      expect(result.updated).toBe(expected);
      expect(result.common).toBe(noneUpdatedCommon);
    });

    it('전 이미지가 nedrug의 이미지이면, 같은 이미지여도 updated true를 반환한다.', () => {
      // arrange
      const expected = true;
      const image = 'nedrug/1234.jpg';
      const beforeMedicine: medicine = {
        ...before,
        image_url: image,
      };
      const common = {
        ...typia.random<Medicine.Common.Dto>(),
        serial_number: before.id,
        image,
      };

      // act
      const result = medicineCommonBatchService.checkImageUpdated$({
        before: beforeMedicine,
        common,
      });

      // assert
      expect(result.updated).toBe(expected);
      expect(result.common).toBe(common);
    });
  });

  describe('uploadAndSetUpdatedImage$', () => {
    // arrange
    const medicineCommon: Medicine.Common.Dto = {
      ...typia.random<Medicine.Common.Dto>(),
      serial_number: '1234',
      image: 'image',
    };
    const medicineCommonNoneImage: Medicine.Common.Dto = {
      ...typia.random<Medicine.Common.Dto>(),
      serial_number: '1234',
      image: '',
    };
    const medicineCommonNoneImageName: Medicine.Common.Dto = {
      ...typia.random<Medicine.Common.Dto>(),
      serial_number: '1234',
      image: 'image/',
    };

    beforeEach(() => {
      s3Service.upload = jest.fn();
      jest
        .spyOn(medicineCommonBatchService, 'fetchImageBuffer$')
        .mockReturnValue(of(Buffer.from('')));
    });
    it('이미지가 없으면, medicineCommon을 반환한다.', async () => {
      // act
      medicineCommonBatchService
        .uploadAndSetUpdatedImage$(medicineCommonNoneImage)
        .subscribe({
          next: (result) => {
            // assert
            expect(result).toBe(medicineCommonNoneImage);
            expect(s3Service.upload).toHaveBeenCalledTimes(0);
          },
        });
    });
    it('이미지 이름이 없으면, medicineCommon을 반환한다.', async () => {
      // act
      medicineCommonBatchService
        .uploadAndSetUpdatedImage$(medicineCommonNoneImageName)
        .subscribe({
          next: (result) => {
            // assert
            expect(result).toBe(medicineCommonNoneImageName);
            expect(s3Service.upload).toHaveBeenCalledTimes(0);
          },
        });
    });
    it('이미지가 있으면, s3에 업로드하고, medicineCommon을 반환한다.', async () => {
      // arrange
      const new_image_url = `https://${process.env.AWS_S3_BUCKET}.s3.ap-northeast-2.amazonaws.com/medicines/${medicineCommon.image}.jpg`;
      const expected = { ...medicineCommon, image: new_image_url };
      s3Service.upload = jest.fn().mockResolvedValue(undefined);
      // act
      medicineCommonBatchService
        .uploadAndSetUpdatedImage$(medicineCommon)
        .subscribe({
          next: (result) => {
            // assert
            expect(result).toStrictEqual(expected);
            expect(s3Service.upload).toHaveBeenCalledTimes(1);
          },
        });
    });
  });

  describe('pickMedicineCommonData', () => {
    const medicineCommon: Medicine.Common.Dto =
      typia.random<Medicine.Common.Dto>();
    it('MedicineCommon을 입력하면, 필요한 데이터 및 키 변경한다.', () => {
      // arrange
      const expected = [
        'id',
        'company_serial_number',
        'pharmacological_class',
        'image_url',
      ];
      // act
      const result =
        medicineCommonBatchService.pickMedicineCommonData(medicineCommon);
      const resultKeys = Object.keys(result);

      // assert
      expect(expected.every((e) => resultKeys.includes(e))).toBe(true);
    });
  });

  describe('bulkUpdateMedicineCommon$', () => {
    beforeEach(() => {
      prismaService.medicine.update = jest.fn().mockResolvedValue(undefined);
    });

    it('업데이트 정보가없으면 업데이트를 진행하지않는다.', () => {
      // arrange
      const input = {
        id: '1234',
      };

      // act
      medicineCommonBatchService.bulkUpdateMedicineCommon$([input]).subscribe({
        next: () => {
          // assert
          expect(prismaService.medicine.update).toHaveBeenCalledTimes(0);
        },
      });
    });

    describe('업데이트 정보가 있으면 업데이트를 진행한다.', () => {
      const testCases: testCase[] = testcaseBuilderBulkUpdateMedicineCommon$();

      it.each(testCases)('$test', (testCase) => {
        // arrange
        const input = testCase.input;
        const expected = testCase.expected;

        // act
        medicineCommonBatchService
          .bulkUpdateMedicineCommon$([input])
          .subscribe({
            next: () => {
              // assert
              expect(prismaService.medicine.update).toHaveBeenCalledTimes(1);
              expect(prismaService.medicine.update).toHaveBeenCalledWith(
                expected,
              );
            },
          });
      });
    });
  });
});

type testCase = {
  test: string;
  input: Prisma.medicineUpdateInput & { id: string };
  expected: {
    where: Prisma.medicineWhereUniqueInput;
    data: Prisma.medicineUpdateInput;
  };
};
function testcaseBuilderBulkUpdateMedicineCommon$(): testCase[] {
  return [
    {
      test: 'pharmacological_class 존재',
      input: {
        id: '1234',
        pharmacological_class: [
          {
            code: 'code',
            name: 'name',
          },
        ],
      },
      expected: {
        where: { id: '1234' },
        data: {
          pharmacological_class: [
            {
              code: 'code',
              name: 'name',
            },
          ],
        },
      },
    },
    {
      test: 'company_serial_number 존재',
      input: {
        id: '1234',
        company_serial_number: 'company_serial_number',
      },
      expected: {
        where: { id: '1234' },
        data: { company_serial_number: 'company_serial_number' },
      },
    },
    {
      test: 'image_url 존재',
      input: {
        id: '1234',
        image_url: 'image_url',
      },
      expected: {
        where: { id: '1234' },
        data: { image_url: 'image_url' },
      },
    },
    {
      test: 'pharmacological_class, company_serial_number 존재',
      input: {
        id: '1234',
        pharmacological_class: [
          {
            code: 'code',
            name: 'name',
          },
        ],
        company_serial_number: 'company_serial_number',
      },
      expected: {
        where: { id: '1234' },
        data: {
          pharmacological_class: [
            {
              code: 'code',
              name: 'name',
            },
          ],
          company_serial_number: 'company_serial_number',
        },
      },
    },
    {
      test: 'pharmacological_class, image_url 존재',
      input: {
        id: '1234',
        pharmacological_class: [
          {
            code: 'code',
            name: 'name',
          },
        ],
        image_url: 'image_url',
      },
      expected: {
        where: { id: '1234' },
        data: {
          pharmacological_class: [
            {
              code: 'code',
              name: 'name',
            },
          ],
          image_url: 'image_url',
        },
      },
    },
    {
      test: 'company_serial_number, image_url 존재',
      input: {
        id: '1234',
        company_serial_number: 'company_serial_number',
        image_url: 'image_url',
      },
      expected: {
        where: { id: '1234' },
        data: {
          company_serial_number: 'company_serial_number',
          image_url: 'image_url',
        },
      },
    },
    {
      test: 'pharmacological_class, company_serial_number, image_url 존재',
      input: {
        id: '1234',
        pharmacological_class: [
          {
            code: 'code',
            name: 'name',
          },
        ],
        company_serial_number: 'company_serial_number',
        image_url: 'image_url',
      },
      expected: {
        where: { id: '1234' },
        data: {
          pharmacological_class: [
            {
              code: 'code',
              name: 'name',
            },
          ],
          company_serial_number: 'company_serial_number',
          image_url: 'image_url',
        },
      },
    },
  ];
}
