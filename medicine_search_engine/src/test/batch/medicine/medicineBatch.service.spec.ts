import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { medicine } from '@prisma/client';
import { MedicineBatchService } from '@src/batch/medicine/medicineBatch.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { Medicine } from '@src/type/medicine';
import { mockDeep } from 'jest-mock-extended';
import typia from 'typia';
import { createTestXslxBufferAndExpected } from './xlsx.testHelper';
describe('MedicineBatchService', () => {
  let mockMedicineBatchService: MedicineBatchService;
  let mockHttpService: HttpService;
  let mockPrismaService: PrismaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 5,
        }),
      ],
      providers: [
        MedicineBatchService,
        { provide: HttpService, useValue: new HttpService() },
        PrismaService,
      ],
    })
      // .overrideProvider(HttpService)
      // .useValue(mockDeep<HttpService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    mockMedicineBatchService =
      module.get<MedicineBatchService>(MedicineBatchService);
    mockHttpService = module.get<HttpService>(HttpService);
    mockPrismaService = module.get<PrismaService>(PrismaService);
    mockPrismaService.medicine.findUnique = jest.fn().mockReturnValue(null);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('기본테스트', () => {
      expect(true).toBe(true);
    });
  });

  describe('대한민국 의약품 제품허가 상세정보 batch pipeline', () => {
    /**
     * 해당 테스트는 실제 데이터를 사용하기 때문에, 실제 데이터를 사용하지 않는 테스트로 대체한다.
     */
    describe('convertMedicineDetailListXlsxToJson', () => {
      const [xlsxBuffer, expected] = createTestXslxBufferAndExpected();
      it('xlsx buffer를 입력 받아 json으로 변환한다', () => {
        // arrange
        // act
        const result =
          mockMedicineBatchService.convertMedicineDetailListXlsxToJson(
            xlsxBuffer,
          );
        // assert
        expect(result).toEqual(expected);
      });
    });

    describe('converMedicineDetailKeyKrToEng', () => {
      // arrange
      // Medicine.DetailJson_Kr mock
      const medicineDetailJsonKr = typia.random<Medicine.DetailJson_Kr>();

      /**
       * Medicine.DetailJson_Kr 타입 = { [한글]:데이터 }
       * Medicine.Detail 타입 = { [영어]:데이터 }
       */
      it('Medicine.DetailJson_Kr 타입을  Medicine.Detail 타입으로 변환한다', () => {
        //arrange
        //영어키 배열
        const expectedKeys = Object.values(
          Medicine.KOR_TO_ENG_KEY_MAP,
        ) as Medicine.DetailEngKey[];

        //act
        const result =
          mockMedicineBatchService.converMedicineDetailKeyKrToEng(
            medicineDetailJsonKr,
          );
        const resultKeys = Object.keys(result);
        //assert
        expect(resultKeys).toEqual(expect.arrayContaining(expectedKeys));
      });
    });

    describe('convertFormatMedicineDetailToDBSchema', () => {
      // arrange
      // Medicine.Detail mock
      const medicineDetail = typia.random<Medicine.Detail>();
      const expected = typia.random<medicine>();
      const expectedKeys = Object.keys(expected);
      beforeEach(() => {
        // 의존함수 모킹 - 각함수는 각각의 테스트를 통해 검증
        mockMedicineBatchService.parseIngredients = jest
          .fn()
          .mockReturnValue(expected.ingredients);

        mockMedicineBatchService.parseCompound = jest
          .fn()
          .mockReturnValue(expected.main_ingredient);

        mockMedicineBatchService.parseChangeContent = jest
          .fn()
          .mockReturnValue(expected.change_content);

        mockMedicineBatchService.parseReExamination = jest
          .fn()
          .mockReturnValue(expected.re_examination);
      });

      /**
       * Medicine.Detail 타입 = { [영어]:데이터 }
       * medicine 타입 = { [영어]:데이터 }
       */
      it('Medicine.Detail 타입을 medicine(prisma) 타입으로 변환한다', () => {
        //act
        const result =
          mockMedicineBatchService.convertFormatMedicineDetailToDBSchema(
            medicineDetail,
          );
        const resultKeys = Object.keys(result);
        //assert
        expect(resultKeys.length).toBe(expectedKeys.length);
        expect(resultKeys).toEqual(expect.arrayContaining(expectedKeys));
      });
    });

    describe('parseIngredients', () => {
      // "1000밀리리터|포도당|USP|50|그램|;1000밀리리터|염화나트륨|KP|9|그램|"
      // "Glucose/Sodium Chloride",
      it('성분 문자열을 파싱하여 배열로 변환한다(단일)', () => {
        // arrange
        const ingredients = '1000밀리리터|포도당|USP|50|그램|';
        const englishIngredients = 'Glucose';
        const expected = [
          {
            amount: '50',
            en: 'Glucose',
            ko: '포도당',
            pharmacopoeia: 'USP',
            unit: '그램',
            standard: '1000밀리리터',
          },
        ];
        // act
        const result = mockMedicineBatchService.parseIngredients(
          ingredients,
          englishIngredients,
        );
        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열을 파싱하여 배열로 변환한다(복합)', () => {
        // arrange
        const ingredients =
          '1000밀리리터|포도당|USP|50|그램|;1000밀리리터|염화나트륨|KP|9|그램|';
        const englishIngredients = 'Glucose/Sodium Chloride';
        const expected = [
          {
            amount: '50',
            en: 'Glucose',
            ko: '포도당',
            pharmacopoeia: 'USP',
            unit: '그램',
            standard: '1000밀리리터',
          },
          {
            amount: '9',
            en: 'Sodium Chloride',
            ko: '염화나트륨',
            pharmacopoeia: 'KP',
            unit: '그램',
            standard: '1000밀리리터',
          },
        ];
        // act
        const result = mockMedicineBatchService.parseIngredients(
          ingredients,
          englishIngredients,
        );
        // assert
        expect(result).toEqual(expect.arrayContaining(expected));
      });

      it('null을 입력받으면 빈배열을 반환한다', () => {
        // arrange
        const ingredients = null;
        const englishIngredients = null;
        const expected = [];
        // act
        const result = mockMedicineBatchService.parseIngredients(
          ingredients,
          englishIngredients,
        );
        // assert
        expect(result).toEqual(expected);
      });
    });

    describe('parseCompound', () => {
      //"[M040702]포도당|[M040426]염화나트륨",
      it('성분 문자열을 파싱하여 배열로 변환한다.(단일)', () => {
        const compound = '[M040702]포도당';
        const expected = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];
        // act
        const result = mockMedicineBatchService.parseCompound(compound);
        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열을 파싱하여 배열로 변환한다.(복합)', () => {
        // arrange
        const compound = '[M040702]포도당|[M040426]염화나트륨';
        const expected = [
          {
            code: 'M040426',
            name: '염화나트륨',
          },
          {
            code: 'M040702',
            name: '포도당',
          },
        ];
        // act
        const result = mockMedicineBatchService.parseCompound(compound);
        // assert
        expect(result).toEqual(expect.arrayContaining(expected));
      });

      it('null을 입력받으면 빈배열을 반환한다', () => {
        // arrange
        const compound = null;
        const expected = [];
        // act
        const result = mockMedicineBatchService.parseCompound(compound);
        // assert
        expect(result).toEqual(expected);
      });
    });

    // TODO: 타임존 관련 이슈
    /**
     * 테스트 코드 내부에서 Date 객체를 타임존 설정없이 생성하면, UTC+0로 생성된다.
     * 하지만, 실제 코드에서는 UTC+9로 생성된다.
     * 해결방법
     * 1. 테스트 코드에서 Date 객체를 생성 할 때, 타임존을 설정한다.
     *    - 해당 방법을 사용해도 되는지는 모르겠다.
     */
    describe('parseChangeContent', () => {
      //"성상, 2021-08-20/성상변경, 2019-07-30/사용상주의사항변경(부작용포함), 2019-01-07/저장방법 및 유효기간(사용기간)변경, 1998-08-20/저장방법 및 유효기간(사용기간)변경, 1998-03-30/저장방법 및 유효기간(사용기간)변경, 1998-02-28/성상변경, 1997-03-25/저장방법 및 유효기간(사용기간)변경, 1997-03-25/성상변경, 1991-05-08/사용상주의사항변경(부작용포함), 1990-03-31/성상변경, 1988-11-11/저장방법 및 유효기간(사용기간)변경, 1984-03-27/효능효과변경, 1980-06-16/사용상주의사항변경(부작용포함), 1980-06-16/용법용량변경, 1980-06-16",
      // 변경내용, 날짜 / 변경내용, 날짜 /..../....
      it('변경된내역 문자열을 파싱하여 배열로 변환한다.(단일)', () => {
        const changeContents = '성상, 2021-08-20';
        const expected = [
          {
            content: '성상',
            date: new Date('2021-08-20'),
          },
        ];

        // act
        const result =
          mockMedicineBatchService.parseChangeContent(changeContents);
        // assert
        expect(result).toEqual(expected);
      });

      it('변경된내역 문자열을 파싱하여 배열로 변환한다.(복합)', () => {
        const changeContents =
          '성상, 2021-08-20/성상변경, 2019-07-30/사용상주의사항변경(부작용포함), 2019-01-07';
        const expected = [
          {
            content: '성상',
            date: new Date('2021-08-20'),
          },
          {
            content: '성상변경',
            date: new Date('2019-07-30'),
          },
          {
            content: '사용상주의사항변경(부작용포함)',
            date: new Date('2019-01-07'),
          },
        ];
        // act
        const result =
          mockMedicineBatchService.parseChangeContent(changeContents);
        // assert
        expect(result).toEqual(expect.arrayContaining(expected));
      });

      it('null을 입력받으면 빈배열을 반환한다', () => {
        // arrange
        const changeContents = null;
        const expected = [];
        // act
        const result =
          mockMedicineBatchService.parseChangeContent(changeContents);
        // assert
        expect(result).toEqual(expected);
      });
    });

    describe('parseReExamination', () => {
      // "재심사대상": "재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)",
      // "재심사기간": "2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25",
      it('재심사기간 문자열을 파싱하여 객체로 변환한다.(단일)', () => {
        // arrange
        const reExamination = '재심사대상(6년)';
        const period = '2018-12-26~2024-12-25';
        const expected = [
          {
            type: '재심사대상(6년)',
            re_examination_start_date: new Date('2018-12-26'),
            re_examination_end_date: new Date('2024-12-25'),
          },
        ];
        // act
        const result = mockMedicineBatchService.parseReExamination(
          reExamination,
          period,
        );
        // assert
        expect(result).toEqual(expected);
      });
    });

    it('재심사기간 문자열을 파싱하여 객체로 변환한다.(복합)', () => {
      const reExamination =
        '재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)';
      const period =
        '2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25';
      const expected = [
        {
          type: '재심사대상(6년)',
          re_examination_start_date: new Date('2018-12-26'),
          re_examination_end_date: new Date('2024-12-25'),
        },
        {
          type: '재심사대상(6년)',
          re_examination_start_date: new Date('2018-12-26'),
          re_examination_end_date: new Date('2024-12-25'),
        },
        {
          type: '재심사대상(6년)',
          re_examination_start_date: null,
          re_examination_end_date: new Date('2024-12-25'),
        },
        {
          type: '재심사대상(6년)',
          re_examination_start_date: null,
          re_examination_end_date: new Date('2024-12-25'),
        },
      ];
      // act
      const result = mockMedicineBatchService.parseReExamination(
        reExamination,
        period,
      );
      // assert
      expect(result).toEqual(expect.arrayContaining(expected));
    });

    it('reExamination 또는 period에 null을 입력받으면 빈배열을 반환한다', () => {
      const reExamination = null;
      const period = null;
      const expected = [];
      // act
      const resultReExaminationNull =
        mockMedicineBatchService.parseReExamination(
          reExamination,
          '2018-12-26~2024-12-25',
        );
      const resultPeriodNull = mockMedicineBatchService.parseReExamination(
        '재심사대상(6년)',
        period,
      );
      const resultBothNull = mockMedicineBatchService.parseReExamination(
        reExamination,
        period,
      );

      // assert
      expect(resultReExaminationNull).toEqual(expected);
      expect(resultPeriodNull).toEqual(expected);
      expect(resultBothNull).toEqual(expected);
    });
  });

  describe('test', () => {
    // it('test', async () => {
    //   const pdfArrayBuffer = await fetch(
    //     'https://nedrug.mfds.go.kr/pbp/cmn/pdfDownload/195600004/UD',
    //   ).then((res) => res.arrayBuffer());
    //   const pdfBuffer = Buffer.from(pdfArrayBuffer);
    //   const a = (await pdf(pdfBuffer)).text;
    //   console.log(a.trim());
    // });
    // it('test', async () => {
    //   const testFn = async (t) => {
    //     return new Promise((resolve) => {
    //       setTimeout(resolve, t * 10);
    //     });
    //   };
    //   const task = async (t: number) => {
    //     await testFn(t);
    //     return t;
    //   };
    //   const obs$ = range(1, 300)
    //     .pipe(bufferCount(100))
    //     .pipe(
    //       mergeMap((item) => item),
    //       mergeMap((item) => task(item), 30),
    //       map((a) => a),
    //       toArray(),
    //     );
    //   const array = await firstValueFrom(obs$);
    //   console.log(array);
    // });
  });

  // describe('changedType', () => {
  //   it('a', async () => {
  //     const a = await firstValueFrom(
  //       mockMedicineBatchService.processMedicineDetail(),
  //     );
  //     const set = new Set();
  //     a.forEach((item) => {
  //       item.change_content.forEach(({ content }) => {
  //         set.add(content);
  //       });
  //     });
  //     console.log(set);
  //   });
  // });
});
