import { HttpModule, HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { MedicineBatchService } from '@src/batch/medicine/medicineBatch.service';
import { S3Service } from '@src/common/aws/s3/s3.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { mockDeep } from 'jest-mock-extended';
describe('MedicineBatchService', () => {
  let mockMedicineBatchService: MedicineBatchService;
  let mockHttpService: HttpService;
  let mockPrismaService: PrismaService;
  let mockS3Service: S3Service;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          timeout: 5000,
          maxRedirects: 0,
        }),
      ],
      providers: [
        MedicineBatchService,
        { provide: HttpService, useValue: new HttpService() },
        PrismaService,
        S3Service,
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
    mockS3Service = module.get<S3Service>(S3Service);
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

    describe('parseIngredients', () => {
      // "1000밀리리터|포도당|USP|50|그램|;1000밀리리터|염화나트륨|KP|9|그램|"
      // "Glucose/Sodium Chloride",
      it('성분 문자열을 파싱하여 배열로 변환한다(단일)', () => {
        // arrange
        const ingredients =
          '총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 :';
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
          '총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 : ;총량 : 1000밀리리터|성분명 : 염화나트륨|분량 : 9|단위 : 그램|규격 : KP|성분정보 : |비고 :';
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

      //   it('null을 입력받으면 빈배열을 반환한다', () => {
      //     // arrange
      //     const compound = null;
      //     const expected = [];
      //     // act
      //     const result = mockMedicineBatchService.parseCompound(compound);
      //     // assert
      //     expect(result).toEqual(expected);
      //   });
      // });

      // TODO: 타임존 관련 이슈
      /**
       * 테스트 코드 내부에서 Date 객체를 타임존 설정없이 생성하면, UTC+0로 생성된다.
       * 하지만, 실제 코드에서는 UTC+9로 생성된다.
       * 해결방법
       * 1. 테스트 코드에서 Date 객체를 생성 할 때, 타임존을 설정한다.
       *    - 해당 방법을 사용해도 되는지는 모르겠다.
       */
      // describe('parseChangeContent', () => {
      //   //"성상, 2021-08-20/성상변경, 2019-07-30/사용상주의사항변경(부작용포함), 2019-01-07/저장방법 및 유효기간(사용기간)변경, 1998-08-20/저장방법 및 유효기간(사용기간)변경, 1998-03-30/저장방법 및 유효기간(사용기간)변경, 1998-02-28/성상변경, 1997-03-25/저장방법 및 유효기간(사용기간)변경, 1997-03-25/성상변경, 1991-05-08/사용상주의사항변경(부작용포함), 1990-03-31/성상변경, 1988-11-11/저장방법 및 유효기간(사용기간)변경, 1984-03-27/효능효과변경, 1980-06-16/사용상주의사항변경(부작용포함), 1980-06-16/용법용량변경, 1980-06-16",
      //   // 변경내용, 날짜 / 변경내용, 날짜 /..../....
      //   it('변경된내역 문자열을 파싱하여 배열로 변환한다.(단일)', () => {
      //     const changeContents = '성상, 2021-08-20';
      //     const expected = [
      //       {
      //         content: '성상',
      //         date: new Date('2021-08-20'),
      //       },
      //     ];

      //     // act
      //     const result =
      //       mockMedicineBatchService.parseChangeContent(changeContents);
      //     // assert
      //     expect(result).toEqual(expected);
      //   });

      //   it('변경된내역 문자열을 파싱하여 배열로 변환한다.(복합)', () => {
      //     const changeContents =
      //       '성상, 2021-08-20/성상변경, 2019-07-30/사용상주의사항변경(부작용포함), 2019-01-07';
      //     const expected = [
      //       {
      //         content: '성상',
      //         date: new Date('2021-08-20'),
      //       },
      //       {
      //         content: '성상변경',
      //         date: new Date('2019-07-30'),
      //       },
      //       {
      //         content: '사용상주의사항변경(부작용포함)',
      //         date: new Date('2019-01-07'),
      //       },
      //     ];
      //     // act
      //     const result =
      //       mockMedicineBatchService.parseChangeContent(changeContents);
      //     // assert
      //     expect(result).toEqual(expect.arrayContaining(expected));
      //   });

      //   it('null을 입력받으면 빈배열을 반환한다', () => {
      //     // arrange
      //     const changeContents = null;
      //     const expected = [];
      //     // act
      //     const result =
      //       mockMedicineBatchService.parseChangeContent(changeContents);
      //     // assert
      //     expect(result).toEqual(expected);
      //   });
      // });

      // describe('parseReExamination', () => {
      //   // "재심사대상": "재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)",
      //   // "재심사기간": "2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25",
      //   it('재심사기간 문자열을 파싱하여 객체로 변환한다.(단일)', () => {
      //     // arrange
      //     const reExamination = '재심사대상(6년)';
      //     const period = '2018-12-26~2024-12-25';
      //     const expected = [
      //       {
      //         type: '재심사대상(6년)',
      //         re_examination_start_date: new Date('2018-12-26'),
      //         re_examination_end_date: new Date('2024-12-25'),
      //       },
      //     ];
      //     // act
      //     const result = mockMedicineBatchService.parseReExamination(
      //       reExamination,
      //       period,
      //     );
      //     // assert
      //     expect(result).toEqual(expected);
      //   });
      // });

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

    // describe('parseStorageMethod', () => {
    //   it('test', () => {
    //     const xml =
    //       '<DOC title="사용상의주의사항" type="NB">\r\n  <SECTION title="">\r\n    <ARTICLE title="1. 경고">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 앰플주사제는 용기 절단시 유리파편이 혼입되어, 이상반응을 초래할 수 있으므로 사용시 유리파편 혼입이 최소화 될 수 있도록 신중하게 절단 사용하되, 특히 어린이, 노약자 사용시에는 각별히 주의할 것(앰플제에 한함.).]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 포도당 함유제제를 정맥주사하는 환자는 치아민(비타민 B<sub>1</sub>)소모율이 높기 때문에 순간적으로 치명적인 치아민 결핍을 초래할 가능성이 있음.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="2. 다음 환자에는 투여하지 말 것.">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 저장성 탈수증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 수분과다상태 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[3) 고혈당 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[4) 산증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[5) 저칼륨혈증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[6) 고삼투압성 혼수 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[7) 내당불내증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[8) 무뇨증, 간성혼수 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[9) 이 약 및 이 약에 포함된 성분에의 과민반응 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[10) 고장액은 탈수증세가 있는 척추관내출혈, 두개내출혈, 진전섬망환자 에게는 투여하지 않는다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="3. 다음 환자에는 신중히 투여할 것.">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 칼륨결핍ㆍ인산결핍ㆍ마그네슘결핍경향이 있는 환자, 저나트륨혈증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 요붕증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[3) 신부전 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[4) 코르티코스테로이드ㆍ코르티코트로핀 투여 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[5) 심부전 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[6) 심한 영양결핍 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[7) 치아민결핍 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[8) 패혈증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[9) 중증 또는 외상 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[10) 심한 탈수ㆍ쇽 상태 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[11) 혈액희석(hemodilution) 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[12) 만성뇨독증 환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[13) 당뇨환자]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[14) 고장성액은 당뇨혼수, 곡물알러지 환자에는 신중히 투여한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="4. 이상반응">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 대량급속 투여에 의해 전해질 상실을 일으킬 수 있으므로 신중히 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 권장용량을 초과하여 투과할 경우 bilirubin, lactate수치가 높아질 수 있다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[3) 저칼륨혈증, 고장성혼수(hyperosmolar coma), 산증(acidosis)]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[4) 탈수증, 고삼투압증]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[5) 포도당 검출이 동반되는 다뇨증]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[6) 정맥주사는 체액 또는 용질과다상태를 유발, 체액전해질 불균형, 울혈, 폐부종을 일으킬 수 있다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[7) 내당불내증환자의 경우 고혈당, 신손실(renal loss)이 일어날 수 있다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[8) 열, 정맥염, 혈전증, 혈액의 유출, 주사부위 통증, 요독증]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="5. 일반적 주의">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 장기간의 투여는 인슐린 생성에 영향을 미칠수 있다. 이를 낮추려면 인슐린을 함께 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 수술후, 외상후, 또는 다른 내당불내증이 있는 경우 5%는 혈당조절하에 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[3) 혈청 전해질 검사를 한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[4) 수분균형을 고려하여 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[5) 혈당농도의 조절을 한다]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[6) 환자상태, 아세톤뇨, 혈중칼륨농도, 혈중인산농도 등의 수치에 유의한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="6. 임부에 대한 투여">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 임신 중 투여에 대한 안전성이 확립되지 않았으므로 치료상의 유익성이 태아에 대한 잠재적 위해성을 상회한다고 판단되는 경우에만 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 분만 중에 포도당을 함유한 용액을 정맥 투여할 경우, 산모에게 고혈당증을 초래할 수 있으며, 신생아의 반동저혈당증 뿐만 아니라, 태아의 고혈당증 및 대사성 산증을 일으킬 수 있다. 태아의 고혈당증은 태아의 인슐린 수치를 증가시킬 수 있으며, 이는 출산 후 신생아 저혈당증을 초래할 수 있다. 해당 약물을 투여하기 전에 환자에 대한 유익성과 위해성을 고려해야 한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="7. 소아에 대한 투여">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[신생아(특히 조산아나 저체중아의 경우)는 저혈당증 또는 고혈당증의 위험이 높아진다. 그러므로 잠재적인 장기간 부작용을 피하기 위한 적절한 혈당 조절을 할 수 있도록 면밀한 모니터링이 필요하다. 신생아의 저혈당증은 발작, 혼수, 뇌손상을 초래할 수 있다. 고혈당증은 뇌실내출혈, 박테리아 및 곰팡이 감염의 후기발병, 미숙아의 망막병증, 괴사성작은창자큰창자염, 기관지폐이형성증, 입원기간의 연장 및 사망과 관련된다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="8. 고령자에 대한 투여">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[일반적으로 고령자는 생리기능이 저하되어 있으므로 신중히 투여한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="9. 과량투여시의 처치">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[고용량 투여로 인한 고혈당증이나, 당뇨(glucosuria)발생시 이에 대한 처치로 인슐린을 투여한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n    <ARTICLE title="10. 적용상의 주의">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[1) 피하 대량 투여에 의해 혈장으로부터 전해질이 이동해서 순환부전을 초래할 수 있고 국소자극이 심하므로 피하주사하지 않는 것이 바람직하다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[2) 개봉한 후에는 바로 사용하며, 사용한 잔액은 사용하지 않는다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[3) 윤주(輪注)하는 경우는 감염의 우려가 있으므로 주의한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[4) 한랭기에는 체온정도로 따뜻하게 하여 사용한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[5) 고장액을 투여하였을 경우 혈전정맥염을 일으킬 수 있으므로 신중히 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[6) 고농도액 투여의 급격한 중지에 의해 저혈당을 일으킬 수 있다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[7) 가응집반응(pseudoagglutination)이 나타날 수 있으므로 혈액과 동시에 투여하지 않는다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[8) 항생제, 비타민제, 간장약, 진통ㆍ진경제, 와파린 등 기타 여러 가지 타 약제를 혼합처방 사용할 때는 이상반응이 나타나는 수가 있으므로 다른 약물의 화학적 물리적 부작용을 충분히 숙지한 다음 신중히 관찰하면서 투여한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[9) 다른 약물을 혼합시 용기 혹은 마개와의 상호작용에 유의하고, 혼합 즉시 사용한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[10) 용기에 있는 공기로 인한 공기색전증의 가능성을 피하기 위하여 연속하여 연결해서는 안 된다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n  </SECTION>\r\n</DOC>';

    //     const a = mockMedicineBatchService
    //       .extractContentFromXml$(xml)
    //       .subscribe(console.log);

    //     const z =
    //       '<DOC title="효능효과" type="EE">\r\n  <SECTION title="">\r\n    <ARTICLE title="1. 탈수증 특히 수분결핍시의 수분보급" />\r\n    <ARTICLE title="2. 주사제의 용해희석제" />\r\n  </SECTION>\r\n</DOC>';
    //     const b = mockMedicineBatchService
    //       .extractContentFromXml$(z)
    //       .subscribe(console.log);

    //     const c =
    //       '<DOC title="용법용량" type="UD">\r\n  <SECTION title="">\r\n    <ARTICLE title="">\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[보통 성인 1일 500～1,000mL를 2～3회 나누어 점적 정맥주사한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[투여속도는 시간당 250～500mL(분당 60～120방울)이고, 영ㆍ유아의 경우 시간당 15～60mL(분당 4～15방울), 고령자의 경우 시간당 250mL(분당 60방울)로 한다.]]></PARAGRAPH>\r\n      <PARAGRAPH tagName="p" textIndent="" marginLeft=""><![CDATA[투여량, 투여속도는 연령, 체중, 증상에 따라 적절히 증감한다.]]></PARAGRAPH>\r\n    </ARTICLE>\r\n  </SECTION>\r\n</DOC>';
    //     const d = mockMedicineBatchService.extractContentFromXml$(c);
    //     d.subscribe((res) => {
    //       console.log(res);
    //     });
    // });
    // });
    describe('parseStorageMethod', () => {
      // it('test', async () => {
      //   const testUrl = await mockS3Service.getPresignedURLs({
      //     bucket: 'hoit-medicine',
      //     fileNames: ['test1', 'test2'],
      //     path: 'test',
      //   });
      //   console.log(testUrl);
      // });
      // it('test', async () => {
      //   const fileurl =
      //     'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085';
      //   const file = await firstValueFrom(
      //     mockHttpService
      //       .get(fileurl, {
      //         responseType: 'arraybuffer',
      //       })
      //       .pipe(map((res) => res.data)),
      //   );
      //   const buffer = Buffer.from(file, 'binary');
      //   const upload = await mockS3Service.upload({
      //     bucket: 'hoit-medicines',
      //     key: 'test/test.jpg',
      //     file: buffer,
      //   });
      //   console.log(upload);
      // });
      // it('test', async () => {
      //   const fileurl =
      //     'https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085';
      //   const a = await mockMedicineBatchService.uploadAndSetImage(
      //     {
      //       id: 'test',
      //       product_type: '의약외품',
      //       company_serial_number: '152035092',
      //     },
      //     fileurl,
      //   );
      //   console.log(a);
      // });
      // it('test', async () => {
      //   const a = await firstValueFrom(
      //     mockMedicineBatchService.batchCommon().pipe(
      //       map(toArray),
      //       catchError((err) => {
      //         console.log(err);
      //         return [];
      //       }),
      //     ),
      //   );
      //   console.log(a);
      // }, 1000000000);
    });
  });
});
