import { HttpService } from '@nestjs/axios';
import { Inject, Injectable } from '@nestjs/common';
import { medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { COMMON_API_URL_BUILD, DETAIL_API_URL_BUILD } from '@src/constant';
import { Medicine } from '@src/type/medicine';
import { renameKeys } from '@src/utils/renameKeys';
import { XMLParser } from 'fast-xml-parser';
import pdf from 'pdf-parse';
import {
  EMPTY,
  catchError,
  firstValueFrom,
  from,
  iif,
  map,
  mergeMap,
  of,
  range,
  reduce,
  retry,
  tap,
} from 'rxjs';
@Injectable()
export class MedicineBatchService {
  logger = console;
  constructor(
    @Inject(HttpService)
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async checkExistMedicine(medicine: medicine) {
    const { id } = medicine;
    if (!id) return { beforeMedicine: null, medicine };
    const exist = await this.prisma.medicine.findUnique({ where: { id } });
    if (!exist) return { beforeMedicine: null, medicine };
    return {
      beforeMedicine: exist,
      medicine,
    };
  }

  extractContentFromXml$(xml?: string | null) {
    if (!xml) return EMPTY;

    type Paragraph = {
      '#text'?: string;
    };

    type Article = {
      '@_title'?: string;
      PARAGRAPH: Paragraph[] | Paragraph;
    };

    type Section = {
      ARTICLE: Article[] | Article;
      '@_title'?: string;
    };

    type XML_DATA = {
      DOC: {
        SECTION: Section[] | Section;
        '@_title'?: string;
      };
    };

    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const parsedXml: XML_DATA = parser.parse(xml);
    if (!parsedXml.DOC) return of('');

    const xmlDocTitle = parsedXml.DOC['@_title']
      ? `\n${parsedXml.DOC['@_title']}`
      : '';
    const xmlSections = Array.isArray(parsedXml.DOC.SECTION)
      ? parsedXml.DOC.SECTION
      : [parsedXml.DOC.SECTION];

    const section$ = from(xmlSections).pipe(
      mergeMap((section) => {
        const sectionTitle = section['@_title']
          ? `\n${section['@_title']}`
          : '';
        const articles = Array.isArray(section.ARTICLE)
          ? section.ARTICLE
          : [section.ARTICLE];

        return from(articles).pipe(
          mergeMap((article) => {
            if (!article) return EMPTY;

            const articleTitle = article['@_title']
              ? `\n${article['@_title']}`
              : '';
            const paragraphs = Array.isArray(article.PARAGRAPH)
              ? article.PARAGRAPH
              : [article.PARAGRAPH];

            const paragraphTexts = paragraphs
              .filter((p) => p && typeof p === 'object') // Ensure p is an object
              .filter((p) => p['#text']) // Ensure p has '#text'
              .map((p) => p['#text']?.trim() || '') // Safely access '#text'
              .join('\n\t');

            return of(`${sectionTitle}${articleTitle}\n\t${paragraphTexts}`);
          }),
        );
      }),
      reduce((acc, text) => `${acc}\n${text}`, xmlDocTitle),
    );

    return section$;
  }

  // processOpenApiDetail$(detail: Medicine.OpenApiDetailDTO) {
  //   return of(detail).pipe(
  //     map((detail) => this.pickAndConvertOpenApiDetailToInfo(detail)),
  //     map((a) => a),
  //   );
  // }

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
          retry({
            count: 3,
            delay: 5000,
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
      console.log(pdfBuffer);
      console.log(PdfBuffer);
      if (!pdfBuffer) return '';
      if (pdfBuffer.byteLength === 0) return '';

      const pdfData = await pdf(pdfBuffer);
      if (!pdfData.text) return '';
      const text = pdfData.text.replaceAll('\x00', ' ');
      return text.trim();
    } catch (err) {
      console.log(err.message);
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
   * 1. 데이터 가져오기, OpenAPI로부터
   *    - 첫 요청은 totalCount를 가져와서 전체 페이지를 계산한다.
   *    - 전체 페이지를 계산하여 다시 요청한다.
   * 2. 데이터 변환하기
   *    - OpenAPI -> Detail (시스템 내부에서 사용하는 데이터 형식)
   *    - Detail -> DB Schema (DB에 저장되는 데이터 형식)
   *
   * 3. 데이터 저장하기 (DB에 저장)
   *
   */

  // detailBatch() {
  //   return this.fetchAndConvertMedicineDetailListXlsx$().pipe(
  //     mergeMap((detailJson_kr) => this.processMedicineDetail$(detailJson_kr)),
  //     mergeMap((medicines) => this.upsertMedicine(medicines), 100),
  //     finalize(() => {
  //       console.log('detailBatch Observable completed');
  //     }),
  //   );
  // }

  fetchOpenApiDetailList$() {
    return of(DETAIL_API_URL_BUILD(process.env.API_KEY!, 1)).pipe(
      mergeMap((url) =>
        this.httpService.get<Medicine.OpenAPiDetailResponse>(url).pipe(
          tap(console.log),
          map(({ data }) => data.body),
          catchError((e) => {
            console.log(e.message);
            return [];
          }),
        ),
      ),
      map((data) => Math.ceil(data.totalCount / data.numOfRows)),
      mergeMap((value) => range(0, value)),
      map((page) => DETAIL_API_URL_BUILD(process.env.API_KEY!, page + 1)),
      mergeMap(
        (url) =>
          this.httpService
            .get<Medicine.OpenAPiDetailResponse>(url, {
              timeout: 1000000,
            })
            .pipe(
              map(({ data }) => data.body.items),
              catchError((e) => {
                console.log(e.message);
                return [];
              }),
            ),
        20,
      ),
      mergeMap((items) => from(items)),
    );
  }

  batch() {
    return this.fetchOpenApiDetailList$().pipe(
      map((item) => this.convertOpenApiDtoToDetail(item)),
      map((item) => this.convertFormatMedicineDetailToDBSchema(item)),
      mergeMap((medicine) => this.setMedicineDetailInfo$(medicine)),
      mergeMap((item) => this.checkExistMedicine(item)),
      map(({ beforeMedicine, medicine }) =>
        this.processMedicineWithBeforeMedicine(medicine, beforeMedicine),
      ),
      mergeMap((medicine) => this.upsertMedicine(medicine), 30),
    );
  }

  processMedicineWithBeforeMedicine(
    medicine: medicine,
    beforeMedicine: medicine | null,
  ) {
    if (!beforeMedicine) return medicine;
    const {
      image_url,
      product_type,
      ingredients_count,
      company_serial_number,
    } = beforeMedicine;

    return {
      ...medicine,
      image_url,
      product_type,
      ingredients_count,
      company_serial_number,
    };
  }

  setMedicineDetailInfo$(medicine: medicine) {
    return of(medicine).pipe(
      mergeMap((medicine) => this.setMedicineCaution(medicine)),
      mergeMap((medicine) => this.setMedicineEffect(medicine)),
      mergeMap((medicine) => this.setMedicineUsage(medicine)),
      mergeMap((medicine) => this.setMedicineDocument$(medicine)),
    );
  }

  async setMedicineDocument$(medicine: medicine) {
    if (!medicine.document_file_url) return medicine;
    const document = await firstValueFrom(
      this.extractContentFromXml$(medicine.document_file_url),
    );
    return {
      ...medicine,
      document,
    };
  }

  async upsertMedicine(medicine: medicine) {
    try {
      console.log(medicine);
      const { id, ...rest } = medicine;
      return await this.prisma.medicine.upsert({
        where: { id: id },
        create: medicine,
        update: { ...rest },
      });
    } catch (error) {
      console.error('Error in upsertMedicine:', error);
      // Handle or throw the error appropriately
    }
  }

  processNotExistsMedicine$(medicine: medicine) {
    return of(medicine).pipe(
      mergeMap((medicine) => this.setMedicineCaution(medicine)),
      mergeMap((medicine) => this.setMedicineEffect(medicine)),
      mergeMap((medicine) => this.setMedicineUsage(medicine)),
    );
  }

  // processExistingMedicine$(medicine: medicine, beforeMedicine?: medicine) {
  //   // detail이후 파이프라인에서 작업한 정보가 있을수있기에 두 객체를 합쳐 이전 사항을 덮어씌워준다.
  //   return of({ ...beforeMedicine, ...medicine }).pipe(
  //     mergeMap((medicine) => this.updateMedicineInfo$(medicine)),
  //   );
  // }

  convertOpenApiDtoToDetail(medicine: Medicine.OpenApiDetailDTO) {
    const keys = Object.keys(
      Medicine.OPEN_API_DETAIL_TO_DETAIL_KEY_MAP,
    ) as Medicine.OpenApiDetailKey[];
    const args: [Medicine.OpenApiDetailKey, Medicine.DetailKey][] = keys.map(
      (key) => [key, Medicine.OPEN_API_DETAIL_TO_DETAIL_KEY_MAP[key]],
    );
    const result = renameKeys(medicine, args, { undefinedToNull: true });
    return result as Medicine.Detail;
  }

  convertFormatMedicineDetailToDBSchema(medicine: Medicine.Detail): medicine {
    const {
      english_ingredients,
      change_date,
      ingredients,
      re_examination_date,
      standard_code,
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
      standard_code: this.parseStandardCode(standard_code),
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
      register_id: medicine.register_id || '',
      atc_code: medicine.atc_code,
      re_examination: this.parseReExamination(
        medicine.re_examination,
        re_examination_date,
      ),
      image_url: null,
      product_type: null,
      company_serial_number: null,
      ingredients_count: null,
    };
  }

  parseStandardCode(standardCode: string | null) {
    if (!standardCode) return [];
    const code = standardCode.split(',');
    return code;
  }

  parseIngredients(
    ingredients: string | null,
    english_ingredients: string | null,
  ): Medicine.Ingredient[] {
    if (!ingredients) return [];

    // ex  "총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 : ;총량 : 1000밀리리터|성분명 : 염화나트륨|분량 : 9|단위 : 그램|규격 : KP|성분정보 : |비고 :"

    // MAIN_INGR_ENG: "SODIUM CHLORIDE|GLUCOSE"
    // ; 으로 split하면 안되는이유 : 성분정보에 ;이 들어갈수있음

    const ingredientsString = ingredients.split(' ;');
    const englishIngredientsString = english_ingredients
      ? english_ingredients.split('/')
      : [];

    const _ingredients = ingredientsString.map((ingredient, index) => {
      const _ingredient = ingredient.split('|').map((item) => {
        const [_, value] = item.split(' : ');
        return value;
      });
      const [standard, ko, amount, unit, pharmacopoeia] = _ingredient;
      const en = englishIngredientsString[index] || '';
      return {
        standard,
        ko,
        en,
        amount,
        unit,
        pharmacopoeia: pharmacopoeia as Medicine.Pharmacopoeia,
      };
    });

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

    const _reExaminations = types
      .map((type, index) => {
        if (!periods[index]) return undefined;
        const [re_examination_start_date, re_examination_end_date] =
          periods[index].split('~');
        return {
          type,
          re_examination_start_date: re_examination_start_date
            ? new Date(re_examination_start_date)
            : null,
          re_examination_end_date: new Date(re_examination_end_date),
        };
      })
      .filter((item) => !!item);

    return _reExaminations as Medicine.ReExamination[];
  }

  async setMedicineEffect(detail: medicine) {
    const { effect } = detail;
    if (!effect) return detail;
    const _effect = await firstValueFrom(this.extractContentFromXml$(effect));
    return {
      ...detail,
      effect: _effect,
    };
  }

  async setMedicineUsage(detail: medicine) {
    const { usage } = detail;
    if (!usage) return detail;
    const _usage = await firstValueFrom(this.extractContentFromXml$(usage));
    return {
      ...detail,
      usage: _usage,
    };
  }

  async setMedicineCaution(detail: medicine) {
    const { caution } = detail;
    if (!caution) return detail;
    const _caution = await firstValueFrom(this.extractContentFromXml$(caution));
    return {
      ...detail,
      caution: _caution,
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

  fetchCommonList$() {
    return of(COMMON_API_URL_BUILD(process.env.API_KEY!, 1)).pipe(
      mergeMap((url) =>
        this.httpService.get<Medicine.OpenApiCommonResponse>(url).pipe(
          map(({ data }) => data.body),
          catchError((e) => {
            console.log(e.message);
            return [];
          }),
        ),
      ),
      map((data) => Math.ceil(data.totalCount / data.numOfRows)),
      mergeMap((value) => range(0, value)),
      map((page) => COMMON_API_URL_BUILD(process.env.API_KEY!, page + 1)),
      mergeMap(
        (url) =>
          this.httpService
            .get<Medicine.OpenApiCommonResponse>(url, {
              timeout: 1000000,
            })
            .pipe(
              map(({ data }) => data.body.items),
              catchError((e) => {
                console.log(e.message);
                return [];
              }),
            ),
        20,
      ),
      mergeMap((items) => from(items)),
    );
  }

  convertOpenApiCommonDtoToCommon(medicine: Medicine.OpenApiCommonDto) {
    const { ITEM_SEQ, PRDUCT_TYPE, ENTP_SEQ, BIG_PRDT_IMG_URL } = medicine;
    return {
      id: ITEM_SEQ,
      product_type: PRDUCT_TYPE,
      company_serial_number: ENTP_SEQ,
      image_url: BIG_PRDT_IMG_URL,
    };
  }

  async checkExistAndMergeCommonMedicine(medicine: {
    id: string;
    product_type: string;
    company_serial_number: string;
    image_url: string;
  }) {
    const { id } = medicine;
    if (!id) return { beforeMedicine: null, medicine };
    const exist = await this.prisma.medicine.findUnique({ where: { id } });
    if (!exist) return { beforeMedicine: null, medicine };
    return {
      beforeMedicine: exist,
      medicine,
    };
  }

  batchCommon() {
    return this.fetchCommonList$().pipe(
      map((item) => this.convertOpenApiCommonDtoToCommon(item)),
      mergeMap((medicine) => this.checkExistAndMergeCommonMedicine(medicine)),
      map(({ medicine, beforeMedicine }) =>
        this.checkImageChanged({ medicine, beforeMedicine }),
      ),
      mergeMap(({ medicine, changed, new_image_url }) =>
        iif(
          () => changed,
          this.uploadAndSetImage(medicine, new_image_url),
          of(medicine),
        ),
      ),
    );
  }

  checkImageChanged({
    medicine,
    beforeMedicine,
  }: {
    medicine: {
      id: string;
      product_type: string;
      company_serial_number: string;
      image_url?: string;
    };
    beforeMedicine: medicine | null;
  }) {
    const { image_url, product_type, company_serial_number, id } = medicine;

    const updated = {
      ...beforeMedicine,
      product_type,
      company_serial_number,
      id,
    };
    if (!beforeMedicine) return { medicine: updated, changed: true };
    const { image_url: beforeIamge } = beforeMedicine;
    //https://nedrug.mfds.go.kr/pbp/cmn/itemImageDownload/152035092098000085
    if (!image_url)
      return {
        medicine: updated,
        changed: true,
        new_image_url: image_url || '',
      };
    const image_name = image_url.split('/').pop();
    const check = beforeIamge?.includes(image_name || '');
    if (check)
      return {
        medicine: updated,
        changed: false,
      };
    return {
      medicine: updated,
      changed: true,
      new_image_url: image_url || '',
    };
  }

  async uploadAndSetImage(
    medicine: {
      id: string;
      product_type: string;
      company_serial_number: string;
    },
    new_image_url?: string,
  ) {
    if (!new_image_url) return medicine;
    const s3Url = 'test';
    const image_url = s3Url;
    return {
      ...medicine,
      image_url,
    };
  }

  // converMedicineCommonKeyKrToEng(medicine: Medicine.CommonJson_Kr) {
  //   const keys = Object.keys(
  //     Medicine.KOR_TO_ENG_KEY_MAP,
  //   ) as Medicine.CommonKorKey[];
  //   const args: [Medicine.CommonKorKey, Medicine.CommonEngKey][] = keys.map(
  //     (key) => [key, Medicine.KOR_TO_ENG_KEY_MAP[key]],
  //   );
  //   const result = renameKeys(medicine, args, { undefinedToNull: true });
  //   return result as Medicine.Common;
  // }

  // checkChangeContents(detail: medicine, standard: Date): [medicine, string[]] {
  //   const { change_content } = detail;
  //   if (!change_content) return [detail, []];

  //   const chaged = change_content
  //     .filter((change) => {
  //       return change.date > standard;
  //     })
  //     .map((change) => {
  //       return change.content;
  //     });

  //   return [detail, chaged];
  // }
}
