import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { Medicine } from '@src/type/medicine';
import { convertXlsxToJson } from '@src/utils/convertXlsxToJson';
import { renameKeys } from '@src/utils/renameKeys';
import pdf from 'pdf-parse';
import {
  catchError,
  finalize,
  firstValueFrom,
  from,
  iif,
  map,
  mergeMap,
  of,
} from 'rxjs';
@Injectable()
export class MedicineBatchService {
  logger = console;
  constructor(
    @Inject(HttpService)
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async fetchArrayBuffer(url: string) {
    const value = await firstValueFrom(
      this.httpService
        .get<ArrayBuffer>(url, {
          responseType: 'arraybuffer',
          timeout: 1000000,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
          },
        })
        .pipe(
          catchError((e) => {
            this.logger.error(e.message);
            return of(null);
          }),
        ),
    );
    if (!value) return null;
    const { data } = value;
    return data;
  }

  async getPdfText(PdfBuffer: ArrayBuffer) {
    try {
      const pdfBuffer = Buffer.from(PdfBuffer);
      if (!pdfBuffer) return '';
      if (pdfBuffer.byteLength === 0) return '';

      const pdfData = await pdf(pdfBuffer);
      if (!pdfData.text) return '';
      const text = pdfData.text.replaceAll('\x00', ' ');
      return text.trim();
    } catch (err) {
      return '';
    }
  }
  save(medicine: medicine) {
    return medicine;
  }

  //------------------------
  // Detail
  //------------------------
  /**
   * 1. 데이터 가져오기,
   * 2. 데이터 변환하기
   *    - key 한글 -> 영어
   *    - format 변환 (Detail -> DB Schema)
   * 3. 데이터 저장하기
   *
   * ## 고려해야할것
   * - 1. db에 이미 있는 데이터인지 확인
   * - 2. 변경된 내용이 있는지 확인
   * - 3. 변경된 내용이 있다면, 변경된 내용만 저장
   *      - 해당 데이터 변경여부는 change_content에 저장되어있음
   *        - 1일단위로 체크
   *      -- 성상  [state]  // 따로 fetch작업 안해도됨
   *      - 성상
   *      - 성상변경
   *
   *      -- 저장방법 [storage_method] // 따로 fetch작업 안해도됨
   *      - 저장방법 및 사용(유효)기간
   *      - 저장방법 및 유효기간(사용기간)변경
   *
   *      -- 제품명  [name] // 따로 fetch작업 안해도됨
   *      - 제품명칭변경
   *      - 제품명
   *
   *      -- 사용상주의사항  [caution]
   *      - 사용상주의사항변경(부작용포함)
   *      - 사용상의 주의사항
   *
   *      -- 효능효과 [effect] - 효능
   *      - 효능효과변경
   *      - 효능·효과
   *
   *      -- 용법용량 [usage]
   *      - 용법용량변경
   *      - 용법·용량
   *
   *
   * - 4. 변경된 내용이 없다면, 저장하지 않음
   *
   */
  detailBatch() {
    return this.fetchAndConvertMedicineDetailListXlsx$().pipe(
      mergeMap((detailJson_kr) => this.processMedicineDetail$(detailJson_kr)),
      mergeMap((medicines) => this.upsertMedicine(medicines), 100),
      finalize(() => {
        console.log('detailBatch Observable completed');
      }),
    );
  }

  async upsertMedicine(medicine: medicine) {
    const { id, ...rest } = medicine;
    return await this.prisma.medicine.upsert({
      where: { id: id },
      create: medicine,
      update: { ...rest },
    });
  }

  fetchAndConvertMedicineDetailListXlsx$() {
    const url =
      'https://nedrug.mfds.go.kr/cmn/xls/down/OpenData_ItemPermitDetail';
    const buffer = this.fetchArrayBuffer(url);
    return of(buffer).pipe(
      mergeMap((buffer) => buffer),
      map((buffer) => this.convertMedicineDetailListXlsxToJson(buffer)),
    );
  }

  processMedicineDetail$(detailJson_kr: Medicine.DetailJson_Kr[]) {
    return from(detailJson_kr).pipe(
      // 2. 데이터 변환하기
      map((medicine) => this.converMedicineDetailKeyKrToEng(medicine)), // - key 한글 -> 영어
      map((medicine) => this.convertFormatMedicineDetailToDBSchema(medicine)), // - format 변환 (Detail -> DB Schema)
      mergeMap((medicine) => this.checkExistMedicine(medicine), 100), // 고려1. db에 이미 있는 데이터인지 확인
      mergeMap(
        ({ beforeMedicine, medicine }) =>
          iif(
            () => !!beforeMedicine,
            this.processExistingMedicine$(medicine, beforeMedicine!),
            this.processNotExistsMedicine$(medicine),
          ),
        50,
      ), // 고려2. 변경된 내용이 있는지 확인
      catchError((err) => {
        this.logger.error('processMedicineDetail$', err.message);
        return [];
      }),
    );
  }

  processNotExistsMedicine$(medicine: medicine) {
    return of(medicine).pipe(
      mergeMap((medicine) => this.setMedicineCaution(medicine)),
      mergeMap((medicine) => this.setMedicineEffect(medicine)),
      mergeMap((medicine) => this.setMedicineUsage(medicine)),
    );
  }

  processExistingMedicine$(medicine: medicine, beforeMedicine?: medicine) {
    // detail이후 파이프라인에서 작업한 정보가 있을수있기에 두 객체를 합쳐 이전 사항을 덮어씌워준다.
    return of({ ...beforeMedicine, ...medicine }).pipe(
      mergeMap((medicine) => this.updateMedicineInfo$(medicine)),
    );
  }

  convertMedicineDetailListXlsxToJson(buffer: any): Medicine.DetailJson_Kr[] {
    return convertXlsxToJson<Medicine.DetailJson_Kr>(buffer);
  }

  converMedicineDetailKeyKrToEng(medicine: Medicine.DetailJson_Kr) {
    const keys = Object.keys(
      Medicine.KOR_TO_ENG_KEY_MAP,
    ) as Medicine.DetailKorKey[];
    const args: [Medicine.DetailKorKey, Medicine.DetailEngKey][] = keys.map(
      (key) => [key, Medicine.KOR_TO_ENG_KEY_MAP[key]],
    );
    const result = renameKeys(medicine, args, { undefinedToNull: true });
    return result as Medicine.Detail;
  }

  convertFormatMedicineDetailToDBSchema(medicine: Medicine.Detail): medicine {
    const {
      document,
      usage,
      effect,
      caution,
      english_ingredients,
      change_date,
      ingredients,
      re_examination_date,
      cancel_date,
      permit_date,
      expiration_date,
      ...rest
    } = medicine;
    //yyyymmdd -> yyyy-mm-dd
    const _cancel_date = cancel_date
      ? cancel_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      : null;
    const _change_date = change_date
      ? change_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      : null;
    const _permit_date = permit_date
      ? permit_date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
      : null;

    return {
      ...rest,
      id: medicine.serial_number,
      cancel_date: _cancel_date ? new Date(_cancel_date) : null,
      type: medicine.type as medicine['type'],
      change_date: _change_date ? new Date(_change_date) : null,
      permit_date: _permit_date ? new Date(_permit_date) : null,
      classification: medicine.classification as medicine['classification'],
      ingredients: this.parseIngredients(
        ingredients || null,
        english_ingredients || null,
      ),
      main_ingredient: this.parseCompound(medicine.main_ingredient),
      additive: this.parseCompound(medicine.additive),
      document_file_url: document || null,

      expiration_date: expiration_date || null,
      change_content: this.parseChangeContent(medicine.change_content),
      insurance_code: medicine.insurance_code
        ? medicine.insurance_code.split(',')
        : [],
      narcotic_type: (medicine.narcotic_type ||
        null) as medicine['narcotic_type'],
      raw_material: (medicine.raw_material || null) as medicine['raw_material'],
      is_new_drug: medicine.is_new_drug ? true : false,
      storage_method: medicine.storage_method || '',
      packing_unit: medicine.packing_unit || '',
      company_number: medicine.company_number,
      register_id: medicine.register_id,
      atc_code: medicine.atc_code,
      re_examination: this.parseReExamination(
        medicine.re_examination,
        re_examination_date,
      ),
      usage_file_url: usage || null,
      caution_file_url: caution || null,
      effect_file_url: effect || null,
      usage: null,
      effect: null,
      caution: null,
    };
  }

  parseIngredients(
    ingredients: string | null,
    english_ingredients: string | null,
  ): Medicine.Ingredient[] {
    if (!ingredients) return [];
    // ex  "1000밀리리터|포도당|USP|50|그램|;1000밀리리터|염화나트륨|KP|9|그램|"
    // standard | ko | Pharmacoepia | amount | unit|;standard | ko | Pharmacoepia | amount | unit
    // amount : amunt + unit
    // ko : ko

    const korIngredients = ingredients.split('|').filter((s) => !!s);
    const chunkSize = 5;
    const chunks = Array(Math.ceil(korIngredients.length / chunkSize))
      .fill(null)
      .map((_, index) => index);
    const korIngredientsChunk = chunks.map(
      (_, index) =>
        !!korIngredients &&
        korIngredients.slice(index * chunkSize, (index + 1) * chunkSize),
    );

    const engIngredients = english_ingredients?.split('/') || [];

    const _ingredients = korIngredientsChunk
      .map((kor, index) => {
        const [standard, ko, pharmacoepia, amount, unit] = kor;
        const en = engIngredients[index] || null;

        return {
          standard: standard.trim().replace(';', ''),
          ko,
          en,
          pharmacopoeia: pharmacoepia as Medicine.Pharmacopoeia,
          amount,
          unit,
        };
      })
      .filter(
        ({ standard, ko, en, pharmacopoeia, amount, unit }) =>
          !!standard && !!ko && !!pharmacopoeia && !!amount && !!unit && !!en,
      );

    return _ingredients;
  }

  parseCompound(compoundString: string | null): Medicine.Compound[] {
    if (!compoundString) return [];

    // "[M040702]포도당|[M040426]염화나트륨",
    const compounds = compoundString.split('|');
    const _compounds = compounds.map((compound) => {
      const [, name] = compound.split(']');

      const regex = /\[(.*?)\]/;
      const match = compound.match(regex);
      const code = match ? match[1] : '';

      return {
        code,
        name,
      };
    });

    return _compounds;
  }

  parseChangeContent(
    changeContentsString: string | null,
  ): Medicine.ChangeContent[] {
    if (!changeContentsString) return [];
    //    변경내용:
    // "성상, 2021-08-20/성상변경, 2019-07-30/사용상주의사항변경(부작용포함), 2019-01-07/저장방법 및 유효기간(사용기간)변경, 1998-08-20/저장방법 및 유효기간(사용기간)변경, 1998-03-30/저장방법 및 유효기간(사용기간)변경, 1998-02-28/성상변경, 1997-03-25/저장방법 및 유효기간(사용기간)변경, 1997-03-25/성상변경, 1991-05-08/사용상주의사항변경(부작용포함), 1990-03-31/성상변경, 1988-11-11/저장방법 및 유효기간(사용기간)변경, 1984-03-27/효능효과변경, 1980-06-16/사용상주의사항변경(부작용포함), 1980-06-16/용법용량변경, 1980-06-16",
    const changeContents = changeContentsString.split('/');
    const _changeContents = changeContents.map((changeContent) => {
      const [content, date] = changeContent.split(',');
      return {
        content,
        date: new Date(date.trim()),
      };
    });
    return _changeContents;
  }

  parseReExamination(
    reExaminationString: string | null,
    periodString: string | null,
  ) {
    if (!reExaminationString) return [];
    if (!periodString) return [];
    // "재심사대상": "재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)",
    // "재심사기간": "2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25",

    const types = reExaminationString.split(',');
    // 기간
    const periods = periodString.split(',');

    const _reExaminations = types.map((type, index) => {
      const [re_examination_start_date, re_examination_end_date] =
        periods[index].split('~');
      return {
        type,
        re_examination_start_date: re_examination_start_date
          ? new Date(re_examination_start_date)
          : null,
        re_examination_end_date: new Date(re_examination_end_date),
      };
    });

    return _reExaminations;
  }

  updateMedicineInfo$(detail: medicine) {
    /**
     *      -- 성상  [state]  // 따로 fetch작업 안해도됨
     *      - 성상
     *      - 성상변경
     *
     *      -- 저장방법 [storage_method] // 따로 fetch작업 안해도됨
     *      - 저장방법 및 사용(유효)기간
     *      - 저장방법 및 유효기간(사용기간)변경
     *
     *      -- 제품명  [name] // 따로 fetch작업 안해도됨
     *      - 제품명칭변경
     *      - 제품명
     *
     *      -- 사용상주의사항  [caution] - RegExp  사용
     *      - 사용상주의사항변경(부작용포함)
     *      - 사용상의 주의사항
     *
     *      -- 효능효과 [effect] - RegExp 효능
     *      - 효능효과변경
     *      - 효능·효과
     *
     *      -- 용법용량 [usage] - RegExp  용법
     *      - 용법용량변경
     *      - 용법·용량
     */
    const medicine$ = of(detail).pipe(
      map((medicne) => this.checkChangeContents(medicne, new Date())),
      mergeMap(([medicine, changed]) =>
        this.checkAndSetMedicineContent(
          medicine,
          changed,
          /효능/,
          this.setMedicineEffect.bind(this),
        ),
      ),
      mergeMap(([medicine, changed]) =>
        this.checkAndSetMedicineContent(
          medicine,
          changed,
          /용법/,
          this.setMedicineUsage.bind(this),
        ),
      ),
      mergeMap(([medicine, changed]) =>
        this.checkAndSetMedicineContent(
          medicine,
          changed,
          /사용/,
          this.setMedicineCaution.bind(this),
        ),
      ),
      map(([medicine, _]) => medicine),
      // 기존 데이터에 url이 있지만, 데이터가 없는경우
      mergeMap((medicine) => this.updateMissingContentFromUrls$(medicine)),
    );
    return medicine$;
  }

  async setMedicineEffect(detail: medicine) {
    const { effect_file_url } = detail;
    if (!effect_file_url) return detail;
    const pdfArrayBuffer = await this.fetchArrayBuffer(effect_file_url);
    if (!pdfArrayBuffer) return detail;
    const text = await this.getPdfText(pdfArrayBuffer);
    return {
      ...detail,
      effect: text,
    };
  }

  async setMedicineUsage(detail: medicine) {
    const { usage_file_url } = detail;
    if (!usage_file_url) return detail;
    const pdfArrayBuffer = await this.fetchArrayBuffer(usage_file_url);
    if (!pdfArrayBuffer) return detail;
    if (pdfArrayBuffer.byteLength === 0) return detail; // pdf가 없는경우
    const text = await this.getPdfText(pdfArrayBuffer);
    return {
      ...detail,
      usage: text,
    };
  }

  async setMedicineCaution(detail: medicine) {
    const { caution_file_url } = detail;
    if (!caution_file_url) return detail;
    const pdfArrayBuffer = await this.fetchArrayBuffer(caution_file_url);
    if (!pdfArrayBuffer) return detail;
    const text = await this.getPdfText(pdfArrayBuffer);
    return {
      ...detail,
      caution: text,
    };
  }

  async checkAndSetMedicineContent(
    medicine: medicine,
    changed: string[],
    regex: RegExp,
    setFn: (medicine: medicine) => Promise<medicine>,
  ): Promise<[medicine, string[]]> {
    return changed.filter((change) => change.match(regex)).length > 0
      ? [await setFn(medicine), changed]
      : [medicine, changed];
  }

  updateMissingContentFromUrls$(medicine: medicine) {
    return of(medicine).pipe(
      mergeMap((medicine) =>
        iif(
          () => !!medicine.effect_file_url && !medicine.effect,
          this.setMedicineEffect(medicine),
          of(medicine),
        ),
      ),
      mergeMap((medicine) =>
        iif(
          () => !!medicine.usage_file_url && !medicine.usage,
          this.setMedicineUsage(medicine),
          of(medicine),
        ),
      ),
      mergeMap((medicine) =>
        iif(
          () => !!medicine.caution_file_url && !medicine.caution,
          this.setMedicineCaution(medicine),
          of(medicine),
        ),
      ),
    );
  }

  //------------------------
  // Common
  //------------------------
  fetchMedicineListXlsx$(url: string) {
    return this.httpService
      .get<ArrayBuffer>(url, {
        responseType: 'arraybuffer',
      })
      .pipe(
        map((res) => res.data),
        catchError((error) => {
          this.logger.error(error.response.data); // 실패한 경우 로그 출력
          return [];
        }),
      );
  }

  convertMedicineCommonListXlsxToJson(buffer: any) {
    return convertXlsxToJson<Medicine.CommonJson_Kr>(buffer);
  }

  converMedicineCommonKeyKrToEng(medicine: Medicine.CommonJson_Kr) {
    const keys = Object.keys(
      Medicine.KOR_TO_ENG_KEY_MAP,
    ) as Medicine.CommonKorKey[];
    const args: [Medicine.CommonKorKey, Medicine.CommonEngKey][] = keys.map(
      (key) => [key, Medicine.KOR_TO_ENG_KEY_MAP[key]],
    );
    const result = renameKeys(medicine, args, { undefinedToNull: true });
    return result as Medicine.Common;
  }

  checkChangeContents(detail: medicine, standard: Date): [medicine, string[]] {
    const { change_content } = detail;
    if (!change_content) return [detail, []];

    const chaged = change_content
      .filter((change) => {
        return change.date > standard;
      })
      .map((change) => {
        return change.content;
      });

    return [detail, chaged];
  }

  async checkExistMedicine(medicine: medicine) {
    const { id } = medicine;
    const exist = await this.prisma.medicine.findUnique({ where: { id } });
    if (!exist) return { beforeMedicine: null, medicine };
    return {
      beforeMedicine: exist,
      medicine,
    };
  }
}
