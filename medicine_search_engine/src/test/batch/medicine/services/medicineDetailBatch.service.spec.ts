import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
import { MedicineDetailBatchService } from '@src/batch/medicine/services/medicineDetailBatch.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import * as constants from '@src/constant';
import { Medicine } from '@src/type/medicine';
import { mockDeep } from 'jest-mock-extended';
import { Observable } from 'rxjs';
import typia from 'typia';
describe('MedicineDetailBatchService', () => {
  let medicineDetailBatchService: MedicineDetailBatchService;
  let httpService: HttpService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule.register({ timeout: 5000 })],
      providers: [
        MedicineDetailBatchService,
        PrismaService,
        { provide: HttpService, useValue: new HttpService() },
      ],
    })
      .overrideProvider(HttpService)
      .useValue(mockDeep<HttpService>())
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    medicineDetailBatchService = module.get<MedicineDetailBatchService>(
      MedicineDetailBatchService,
    );
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /// ------------------ UTILS ------------------
  describe('utils', () => {
    // 날짜를 포맷팅하는 함수
    describe('formatDate', () => {
      it('null을 입력시 null을 반환한다.', () => {
        // arrange
        const dateString = null;
        const expected = null;

        // act
        const result = medicineDetailBatchService.formatDate(dateString);

        // assert
        expect(result).toEqual(expected);
      });

      it('빈 문자열을 입력시 null을 반환한다.', () => {
        // arrange
        const dateString = '';
        const expected = null;

        // act
        const result = medicineDetailBatchService.formatDate(dateString);

        // assert
        expect(result).toEqual(expected);
      });

      it('yyyy-mm-dd를 입력시 Date 객체를 반환한다', () => {
        // arrange
        const dateString = '2021-01-01';
        const expected = new Date('2021-01-01');

        // act
        const result = medicineDetailBatchService.formatDate(dateString);

        // assert
        expect(result).toEqual(expected);
      });

      it('yyyy-mm-dd hh:mm:ss를 입력시 Date 객체를 반환한다', () => {
        // arrange
        const dateString = '2021-01-01 00:00:00';
        const expected = new Date('2021-01-01 00:00:00');

        // act
        const result = medicineDetailBatchService.formatDate(dateString);

        // assert
        expect(result).toEqual(expected);
      });

      it('yyyymmdd를 입력시 Date 객체를 반환한다', () => {
        // arrange
        const dateString = '20210101';
        const expected = new Date('2021-01-01');

        // act
        const result = medicineDetailBatchService.formatDate(dateString);

        // assert
        expect(result).toEqual(expected);
      });
    });

    // 의약품의 표준코드를 파싱하는 함수
    describe('parceStandardCode', () => {
      it('xxxxx형식의 표준코드를 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345';
        const expected = ['12345'];

        // act
        const result =
          medicineDetailBatchService.parseStandardCode(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('xxxxx,xxxxx형식의 표준코드를 입력시 배열을 반환한다', () => {
        // arrange
        const standardCode = '12345,67890';
        const expected = ['12345', '67890'];

        // act
        const result =
          medicineDetailBatchService.parseStandardCode(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('null을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = null;
        const expected = [];

        // act
        const result =
          medicineDetailBatchService.parseStandardCode(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('빈 문자열을 입력시 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = '';
        const expected = [];

        // act
        const result =
          medicineDetailBatchService.parseStandardCode(standardCode);

        // assert
        expect(result).toEqual(expected);
      });

      it('코드를 입력하지 않으면 빈 배열을 반환한다', () => {
        // arrange
        const standardCode = undefined;
        const expected = [];

        // act
        const result =
          medicineDetailBatchService.parseStandardCode(standardCode);

        // assert
        expect(result).toEqual(expected);
      });
    });

    // 의약품의 성분을 파싱하는 함수
    describe('parseIngredients', () => {
      // arrange
      const ingredientStr =
        '총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 : ;총량 : 1000밀리리터|성분명 : 염화나트륨|분량 : 9|단위 : 그램|규격 : KP|성분정보 : |비고 :';
      const englishIngredientsStr = 'Glucose/Sodium Chloride';

      const singleIngredientStr =
        '총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 :';
      const singleEnglishIngredientsStr = 'Glucose';

      it('성분의 한글 문자열과, 영어 문자열을 둘다 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // arrange
        const expected: Medicine.Ingredient[] = [
          {
            ko: '포도당',
            en: 'Glucose',
            amount: '50',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'USP',
          },
          {
            ko: '염화나트륨',
            en: 'Sodium Chloride',
            amount: '9',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'KP',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseIngredients(
          ingredientStr,
          englishIngredientsStr,
        );

        // assert
        expect(result).toEqual(expected);
      });

      it('성분의 한글 문자열과, 영어 문자열을 둘다 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // arrange
        const expected: Medicine.Ingredient[] = [
          {
            ko: '포도당',
            en: 'Glucose',
            amount: '50',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'USP',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseIngredients(
          singleIngredientStr,
          singleEnglishIngredientsStr,
        );

        // assert
        expect(result).toEqual(expected);
      });

      it('성분의 한글 문자열만 입력시 해당 성분의 영어이름은 ""인 객체 배열을 반환한다.(복합)', () => {
        // arrange
        const englishIngredientsStr = '';
        const expected: Medicine.Ingredient[] = [
          {
            ko: '포도당',
            en: '',
            amount: '50',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'USP',
          },
          {
            ko: '염화나트륨',
            en: '',
            amount: '9',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'KP',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseIngredients(
          ingredientStr,
          englishIngredientsStr,
        );

        // assert
        expect(result).toEqual(expected);
      });

      it('성분의 한글 문자열만 입력시 해당 성분의 영어이름은 ""인 객체 배열을 반환한다.(단일)', () => {
        // arrange
        const englishIngredientsStr = '';
        const expected: Medicine.Ingredient[] = [
          {
            ko: '포도당',
            en: '',
            amount: '50',
            unit: '그램',
            standard: '1000밀리리터',
            pharmacopoeia: 'USP',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseIngredients(
          singleIngredientStr,
          englishIngredientsStr,
        );

        // assert
        expect(result).toEqual(expected);
      });

      it('한글 성분의 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // arrange
        const ingredientStr = '';
        const expected: Medicine.Ingredient[] = [];

        // act
        const result = medicineDetailBatchService.parseIngredients(
          ingredientStr,
          englishIngredientsStr,
        );

        // assert
        expect(result).toEqual(expected);
      });
    });

    // 의약품의 성분을 파싱하는 함수
    describe('parseCompounds', () => {
      // arrange
      const compounds = '[M040702]포도당|[M040426]염화나트륨';
      const singleCompound = '[M040702]포도당';

      it('성분의 한글 문자열을 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // arrange
        const expected: Medicine.Compound[] = [
          {
            code: 'M040702',
            name: '포도당',
          },
          {
            code: 'M040426',
            name: '염화나트륨',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseCompounds(compounds);

        // assert
        expect(result).toEqual(expected);
      });

      it('성분의 한글 문자열을 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // arrange
        const expected: Medicine.Compound[] = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result =
          medicineDetailBatchService.parseCompounds(singleCompound);

        // assert
        expect(result).toEqual(expected);
      });

      it('한글 성분의 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // arrange
        const compounds = '';
        const expected: Medicine.Compound[] = [];

        // act
        const result = medicineDetailBatchService.parseCompounds(compounds);

        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열의 형식이 [xxxx]ooo가 아니면 해당 성분은 제외한다.(복합)', () => {
        // arrange
        const compounds = '<code>name|[M040702]포도당';
        const expected: Medicine.Compound[] = [
          {
            code: 'M040702',
            name: '포도당',
          },
        ];

        // act
        const result = medicineDetailBatchService.parseCompounds(compounds);

        // assert
        expect(result).toEqual(expected);
      });

      it('성분 문자열의 형식이 [xxxx]ooo가 아니면 해당 성분은 제외한다.(단일)', () => {
        // arrange
        const compounds = '<code>name';
        const expected: Medicine.Compound[] = [];

        // act
        const result = medicineDetailBatchService.parseCompounds(compounds);

        // assert
        expect(result).toEqual(expected);
      });
    });

    // 의약품의 변경사항을 파싱하는 함수
    describe('parseChangedContents', () => {
      const changedContents = '성상, 2021-08-20/성상변경, 2019-07-30';
      const expected: Medicine.ChangeContent[] = [
        {
          content: '성상',
          date: new Date('2021-08-20'),
        },
        {
          content: '성상변경',
          date: new Date('2019-07-30'),
        },
      ];
      const singleChangedContents = '성상, 2021-08-20';
      const singleExpected: Medicine.ChangeContent[] = [
        {
          content: '성상',
          date: new Date('2021-08-20'),
        },
      ];
      const emptyChangedContents = '';
      const nullChangedContents = null;
      const nullOrEmptyExpected: Medicine.ChangeContent[] = [];
      const changedContentsWithSlash = '성상, 2021-08-20/성상변경, 2019-07-30/';
      const expectedWithSlash: Medicine.ChangeContent[] = [
        {
          content: '성상',
          date: new Date('2021-08-20'),
        },
        {
          content: '성상변경',
          date: new Date('2019-07-30'),
        },
      ];

      it('null을 입력시 빈 배열을 반환한다.', () => {
        // act
        const result =
          medicineDetailBatchService.parseChangedContents(nullChangedContents);

        // assert
        expect(result).toEqual(nullOrEmptyExpected);
      });

      it('빈 문자열을 입력시 빈 배열을 반환한다.', () => {
        // act
        const result =
          medicineDetailBatchService.parseChangedContents(emptyChangedContents);

        // assert
        expect(result).toEqual(nullOrEmptyExpected);
      });

      it('변경내용 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // act
        const result =
          medicineDetailBatchService.parseChangedContents(undefined);

        // assert
        expect(result).toEqual(nullOrEmptyExpected);
      });

      it('변경내용 문자열을 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // act
        const result =
          medicineDetailBatchService.parseChangedContents(changedContents);

        // assert
        expect(result).toEqual(expected);
      });

      it('변경내용 문자열을 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // arrange
        // act
        const result = medicineDetailBatchService.parseChangedContents(
          singleChangedContents,
        );

        // assert
        expect(result).toEqual(singleExpected);
      });

      it('마지막에 구분자가 있으면 제외하고 반환한다.', () => {
        // arrange
        // act
        const result = medicineDetailBatchService.parseChangedContents(
          changedContentsWithSlash,
        );

        // assert
        expect(result).toEqual(expectedWithSlash);
      });
    });

    // 의약품의 재심사정보를 파싱하는 함수
    describe('parseReExaminations', () => {
      const reExaminationsStr =
        '재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)';
      const periodStr =
        '2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25';
      const expected: Medicine.ReExamination[] = [
        {
          re_examination_start_date: new Date('2018-12-26'),
          re_examination_end_date: new Date('2024-12-25'),
          type: '재심사대상(6년)',
        },
        {
          re_examination_start_date: new Date('2018-12-26'),
          re_examination_end_date: new Date('2024-12-25'),
          type: '재심사대상(6년)',
        },
        {
          re_examination_start_date: null,
          re_examination_end_date: new Date('2024-12-25'),
          type: '재심사대상(6년)',
        },
        {
          re_examination_start_date: null,
          re_examination_end_date: new Date('2024-12-25'),
          type: '재심사대상(6년)',
        },
      ];

      const singleReExaminationsStr = '재심사대상(6년)';
      const singlePeriodStr = '2018-12-26~2024-12-25';
      const singleExpected: Medicine.ReExamination[] = [
        {
          re_examination_start_date: new Date('2018-12-26'),
          re_examination_end_date: new Date('2024-12-25'),
          type: '재심사대상(6년)',
        },
      ];

      const nullReExaminationsStr = [];

      it('재심사대상 문자열과, 기간 문자열을 둘다 입력시 해당 객체 배열을 반환한다.(복합)', () => {
        // act
        const result = medicineDetailBatchService.parseReExaminations(
          reExaminationsStr,
          periodStr,
        );

        // assert
        expect(result).toEqual(expected);
      });

      it('재심사대상 문자열과, 기간 문자열을 둘다 입력시 해당 객체 배열을 반환한다.(단일)', () => {
        // act
        const result = medicineDetailBatchService.parseReExaminations(
          singleReExaminationsStr,
          singlePeriodStr,
        );

        // assert
        expect(result).toEqual(singleExpected);
      });

      it('재심사대상 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // act
        const result = medicineDetailBatchService.parseReExaminations(
          null,
          periodStr,
        );

        // assert
        expect(result).toEqual(nullReExaminationsStr);
      });

      it('기간 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // act
        const result = medicineDetailBatchService.parseReExaminations(
          reExaminationsStr,
          null,
        );

        // assert
        expect(result).toEqual(nullReExaminationsStr);
      });

      it('재심사대상,기간 문자열을 입력하지 않으면 빈 배열을 반환한다.', () => {
        // act
        const result = medicineDetailBatchService.parseReExaminations(
          null,
          null,
        );

        // assert
        expect(result).toEqual(nullReExaminationsStr);
      });
    });
  });

  /// --------------- MARKUP LANGUAGE PARSER  ----------------
  describe('Markup Language Parser - extractDocFromML', () => {
    it('null을 입력할시, ""을 반환한다.', () => {
      // act
      const result = medicineDetailBatchService.extractDocFromML(null);
      // assert
      expect(result).toEqual('');
    });
    it('빈 문자열을 입력할시, ""을 반환한다.', () => {
      // act
      const result = medicineDetailBatchService.extractDocFromML('');
      // assert
      expect(result).toEqual('');
    });

    it('인자를 입력하지 않으면 ""을 반환한다.', () => {
      const result = medicineDetailBatchService.extractDocFromML(undefined);
      // assert
      expect(result).toEqual('');
    });

    describe('xml', () => {
      it('1_xml 포맷의 문자열을 입력할시, 해당 문자열 정보를 추출한다. xml-1', () => {
        const xmlString =
          '<DOC title="효능효과" type="EE">\r\n  <SECTION title="">\r\n    <ARTICLE title="1. 탈수증 특히 수분결핍시의 수분보급" />\r\n    <ARTICLE title="2. 주사제의 용해희석제" />\r\n  </SECTION>\r\n</DOC>';
        const includeList = [
          '효능효과',
          '1. 탈수증 특히 수분결핍시의 수분보급',
          '2. 주사제의 용해희석제',
        ];
        // act
        const result = medicineDetailBatchService.extractDocFromML(xmlString);
        // assert
        expect(includeList.every((v) => result.includes(v))).toBe(true);
        expect(result).not.toEqual(xmlString);
      });

      it('2_xml 포맷의 문자열을 입력할시, 해당 문자열 정보를 추출한다.', () => {
        const xmlString =
          '<DOC title="용법용량" type="UD">\r\n  <SECTION title="">\r\n    <ARTICLE title="">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(주사제)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(5%)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 성인 : 1회 500∼1000 mL 정맥주사한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 점적정맥주사 속도는 포도당으로서 시간당 0.5 g/kg 이하로 한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 주사제의 용해 희석에는 적당량을 사용한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[연령, 증상에 따라 적절히 증감한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n  </SECTION>\r\n</DOC>';
        const includeList = [
          '용법용량',
          '(주사제)',
          '(5%)',
          '○ 성인 : 1회 500∼1000 mL 정맥주사한다.',
          '○ 점적정맥주사 속도는 포도당으로서 시간당 0.5 g/kg 이하로 한다.',
          '○ 주사제의 용해 희석에는 적당량을 사용한다.',
          '연령, 증상에 따라 적절히 증감한다.',
        ];
        // act
        const result = medicineDetailBatchService.extractDocFromML(xmlString);
        // assert
        expect(includeList.every((v) => result.includes(v))).toBe(true);
        expect(result).not.toEqual(xmlString);
      });
    });

    describe('html', () => {
      it('1_html 포맷의 문자열을 입력할시, 해당 문자열 정보를 추출한다.', () => {
        const html = `<p>효능효과</p><div>a</div><div>a</div><p>용법 용량</p><p>주의사항</p>`;
        const includeList = ['효능효과', '용법 용량', '주의사항'];
        // act
        const result = medicineDetailBatchService.extractDocFromML(html);
        // assert
        expect(includeList.every((v) => result.includes(v))).toBe(true);
        expect(result).not.toEqual(html);
      });

      it('2_html 포맷의 문자열을 입력할시, 해당 문자열 정보를 추출한다.', () => {
        const html = `
        <div>
          <h1>효능효과</h1>
          <p>test</p>
          <div>test2</div>
          <table> 
            <tr>
              <td>test3</td>
            </tr>
          </table>
        </div>
        `;
        const includeList = ['효능효과', 'test', 'test2', 'test3'];

        // act
        const result = medicineDetailBatchService.extractDocFromML(html);
        // assert
        expect(includeList.every((v) => result.includes(v))).toBe(true);
        expect(result).not.toEqual(html);
      });
    });
  });

  // ------------------ FETCH -------------------
  // 데이터 요청 함수이기에 자세한 테스트 생략.
  describe('fetchOpenApiDetailPage$', () => {
    it('페이지 번호를 입력하면,  DETAIL_API_URL_BUILD(key,pageNo)으로 get를 한번 요청한다', () => {
      httpService.get = jest.fn().mockReturnValue(new Observable());
      const page = 1;
      const expected = 1;
      jest.spyOn(constants, 'DETAIL_API_URL_BUILD');

      // act
      medicineDetailBatchService.fetchOpenApiDetailPage$(page).subscribe();

      // assert
      expect(httpService.get).toHaveBeenCalledTimes(expected);
      expect(constants.DETAIL_API_URL_BUILD).toHaveBeenCalledWith(
        expect.anything(),
        page,
      );
    });

    it('요청에 실패하면, 3번 재시도한다.', (done) => {
      const retryCount = 3;
      const callCount = retryCount + 1; // 최초 요청 + 재시도 횟수
      const pageNo = 1;

      let count = 0;
      jest.spyOn(httpService, 'get').mockReturnValue(
        new Observable((subscriber) => {
          count++;
          if (count < callCount) {
            subscriber.error('error');
          } else {
            subscriber.next({
              data: typia.random<Medicine.OpenAPiDetailResponse>(),
            } as unknown as any);
          }
        }),
      );

      // 서비스 메소드 호출
      medicineDetailBatchService
        .fetchOpenApiDetailPage$(pageNo, 0)
        .subscribe(() => {
          // assert
          expect(count).toEqual(callCount);
          done();
        });
    });
  });

  //------------------ CONVERT ------------------
  describe('convert', () => {.
    describe('convertOpenApiDetailToMedicineDetail', () => {
      const openApiDetail = typia.random<Medicine.OpenApiDetailDTO>();
      const expected = Object.values(
        Medicine.OPEN_API_DETAIL_TO_DETAIL_KEY_MAP,
      );

      it('OpenApiDetailDTO를 입력하면 MedicineDetailDTO를 반환한다.', () => {
        // act
        const result =
          medicineDetailBatchService.convertOpenApiDetailToMedicineDetail(
            openApiDetail,
          );

        // assert
        // 이렇게하면 순서에 의존적이라서 안됨.
        // expect(Object.keys(result)).toEqual(expected);

        // 순서의존성 제거
        expect(expected.every((v) => Object.keys(result).includes(v))).toBe(
          true,
        );
      });
    });

    describe('convertMedicineDetailToPrismaMedicine', () => {
      const medicineDetail = typia.random<Medicine.Detail>();
      const medicineCreateInput = typia.random<Prisma.medicineCreateInput>();
      const medicineCreateInputKeys = Object.keys(medicineCreateInput);

      it('MedicineDetailDTO를 입력하면 Prisma.medicineCreateInput를 반환한다.', () => {
        // act
        const result =
          medicineDetailBatchService.convertMedicineDetailToPrismaMedicine(
            medicineDetail,
          );
        const resultKeys = Object.keys(result);

        // assert
        expect(
          resultKeys.every((v) => medicineCreateInputKeys.includes(v)),
        ).toBe(true);
      });
    });
  });

  // -------- SET MEDICINE DOCUMENT INFO --------
  describe('setMedicineDocumentInfo', () => {
    const xmlString =
      '<DOC title="용법용량" type="UD">\r\n  <SECTION title="">\r\n    <ARTICLE title="">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(주사제)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(5%)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 성인 : 1회 500∼1000 mL 정맥주사한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 점적정맥주사 속도는 포도당으로서 시간당 0.5 g/kg 이하로 한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 주사제의 용해 희석에는 적당량을 사용한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[연령, 증상에 따라 적절히 증감한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n  </SECTION>\r\n</DOC>';
    it('medicineCreateInput과, documentType을 입력시 해당 doc문서를 파싱하여 medicineCreateInput에 세팅한다.', async () => {
      // arrange
      const medicineCreateInput: Prisma.medicineCreateInput = {
        ...typia.random<Prisma.medicineCreateInput>(),
        usage: xmlString,
      };
      const usageIncludeList = [
        '(주사제)',
        '(5%)',
        '○ 성인 : 1회 500∼1000 mL 정맥주사한다.',
        '○ 점적정맥주사 속도는 포도당으로서 시간당 0.5 g/kg 이하로 한다.',
        '○ 주사제의 용해 희석에는 적당량을 사용한다.',
        '연령, 증상에 따라 적절히 증감한다.',
      ];

      // act
      const result = await medicineDetailBatchService.setMedicineDocumentInfo(
        medicineCreateInput,
        'usage',
      );
      const usage = result.usage;

      // assert
      expect(usageIncludeList.every((v) => usage && usage.includes(v))).toBe(
        true,
      );
      expect(usage).not.toEqual(xmlString);
    });
  });

  describe('setMedicineDetailDocumentInfo$', () => {
    const xmlString =
      '<DOC title="용법용량" type="UD">\r\n  <SECTION title="">\r\n    <ARTICLE title="">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(주사제)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[(5%)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 성인 : 1회 500∼1000 mL 정맥주사한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 점적정맥주사 속도는 포도당으로서 시간당 0.5 g/kg 이하로 한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[○ 주사제의 용해 희석에는 적당량을 사용한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="0" marginLeft="2"><![CDATA[연령, 증상에 따라 적절히 증감한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n  </SECTION>\r\n</DOC>';
    const medicineCreateInput: Prisma.medicineCreateInput = {
      ...typia.random<Prisma.medicineCreateInput>(),
      usage: xmlString,
    };

    it('인자에 medicineCreateInput를 입력할시 effect, usage, caution, document를 셋팅한다', () => {
      // arrange
      jest.spyOn(medicineDetailBatchService, 'setMedicineDocumentInfo');
      const callList = ['effect', 'usage', 'caution', 'document'];

      // act
      medicineDetailBatchService
        .setMedicineDetailDocumentInfo$(medicineCreateInput)
        .subscribe();

      // assert
      expect(
        medicineDetailBatchService.setMedicineDocumentInfo,
      ).toHaveBeenCalledTimes(callList.length);

      callList.forEach((v) => {
        expect(
          medicineDetailBatchService.setMedicineDocumentInfo,
        ).toHaveBeenCalledWith(expect.anything(), v);
      });
    });
  });
});
