import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Prisma, medicine } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { DETAIL_API_URL_BUILD } from '@src/constant';
import { Medicine } from '@src/type/medicine';
import { renameKeys } from '@src/utils/renameKeys';
import { typedEntries } from '@src/utils/typedEntries';
import { Parser } from 'htmlparser2';
import {
  bufferCount,
  delay,
  from,
  map,
  mergeMap,
  of,
  retry,
  toArray,
} from 'rxjs';
/**
 * ----------------------
 * MEDICINE DETAILS BATCH
 * ----------------------
 * 식품의약품안전처_의약품 제품 허가정보 중 허가목록 상세정보 배치 관련 서비스
 */
@Injectable()
export class MedicineDetailBatchService {
  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  // --------------------------------
  // BATCH
  // --------------------------------
  async batch(sort: 'ASC' | 'DESC' = 'ASC') {
    return this.fetchOpenApiDetailList$(1, sort).pipe(
      map((openApiDetail) =>
        this.convertOpenApiDetailToMedicineDetail(openApiDetail),
      ),
      map((medicineDetail) =>
        this.convertMedicineDetailToPrismaMedicine(medicineDetail),
      ),
      // 문서 정보 설정
      mergeMap((medicine) => this.setMedicineDetailDocInfo$(medicine)),
      bufferCount(100),
      // 데이터베이스 체크 및 업데이트
      mergeMap((medicineDetails) =>
        this.bulkCheckAndUpsertMedicineDetails(medicineDetails),
      ),
      retry({ count: 3, delay: 5000 }),
    );
  }

  /// --------------------------------
  /// FETCH MEDICINE DETAIL PAGE
  /// --------------------------------
  fetchOpenApiDetailPage$(pageNo: number) {
    return this.httpService
      .get<Medicine.OpenAPiDetailResponse>(
        DETAIL_API_URL_BUILD(process.env.API_KEY!, pageNo),
      )
      .pipe(map(({ data }) => data.body));
  }

  // ---------------------------------
  // FETCH MEDICINE DETAILS
  // ---------------------------------
  fetchOpenApiDetailList$(batchSize?: number, sort: 'ASC' | 'DESC' = 'ASC') {
    return this.fetchOpenApiDetailPage$(1).pipe(
      map((body) => {
        const totalCount = body.totalCount;
        const totalPage = Math.ceil(totalCount / 100);
        const pageList = Array.from({ length: totalPage }, (_, i) => i + 1);
        return pageList;
      }),
      map((pageList) => (sort === 'ASC' ? pageList : pageList.reverse())),
      mergeMap((page) => page),
      mergeMap(
        (pageNo) => this.fetchOpenApiDetailPage$(pageNo),
        batchSize || 1,
      ),
      mergeMap(({ items }) => items),
    );
  }

  // -------------------------------------------
  // CONVERT MEDICINE
  // -------------------------------------------
  // OPEN API DETAIL TO DETAIL
  convertOpenApiDetailToMedicineDetail(
    medicine: Medicine.OpenApiDetailDTO,
  ): Medicine.Detail {
    const args = typedEntries(Medicine.OPEN_API_DETAIL_TO_DETAIL_KEY_MAP);
    const converted = renameKeys(medicine, args, {
      undefinedToNull: true,
    });
    return converted;
  }

  // DETAIL TO Prisma.medcine
  convertMedicineDetailToPrismaMedicine(
    medicine: Medicine.Detail,
  ): Prisma.medicineCreateInput {
    const {
      cancel_date,
      change_date,
      permit_date,
      english_ingredients,
      ingredients,
      standard_code,
      additive,
      main_ingredient,
      change_content,
      re_examination,
      re_examination_date,
      is_new_drug,
      insurance_code,
      packing_unit,
      storage_method,
      ...rest
    } = medicine;
    const id = medicine.serial_number;
    const _cancel_date = this.formatDate(cancel_date);
    const _change_date = this.formatDate(change_date);
    const _permit_date = this.formatDate(permit_date);
    const _ingredients = this.parseIngredients(
      ingredients,
      english_ingredients,
    );
    const _standard_code = this.parseStandardCode(standard_code);
    const _additive = this.parseCompounds(additive);
    const _main_ingredient = this.parseCompounds(main_ingredient);
    const _change_content = this.parseChangedContents(change_content);
    const _re_examination = this.parseReExaminations(
      re_examination,
      re_examination_date,
    );
    const _is_new_drug = !!is_new_drug as medicine['is_new_drug'];
    const _insurance_code = insurance_code ? insurance_code.split(',') : [];
    const _packing_unit = packing_unit ?? '';
    const _storage_method = storage_method ?? '';
    return {
      ...rest,
      id,
      cancel_date: _cancel_date,
      change_date: _change_date,
      permit_date: _permit_date,
      ingredients: _ingredients,
      standard_code: _standard_code,
      additive: _additive,
      main_ingredient: _main_ingredient,
      change_content: _change_content,
      re_examination: _re_examination,
      is_new_drug: _is_new_drug,
      insurance_code: _insurance_code,
      packing_unit: _packing_unit,
      storage_method: _storage_method,
    };
  }

  // -------------------------------------------
  // SET MEDICINE DOCUMENT INFO
  // -------------------------------------------
  setMedicineDocumentInfo(
    detail: Prisma.medicineCreateInput,
    documentType: 'effect' | 'usage' | 'caution' | 'document',
  ): Prisma.medicineCreateInput {
    const documentContent = detail[documentType];
    if (!documentContent) return detail;

    const extractedContent = this.extractDocFromML(documentContent);
    return {
      ...detail,
      [documentType]: extractedContent,
    };
  }

  setMedicineDetailDocInfo$(medicine: Prisma.medicineCreateInput) {
    return of(medicine).pipe(
      map((medicine) => this.setMedicineDocumentInfo(medicine, 'effect')),
      map((medicine) => this.setMedicineDocumentInfo(medicine, 'usage')),
      map((medicine) => this.setMedicineDocumentInfo(medicine, 'caution')),
      map((medicine) => this.setMedicineDocumentInfo(medicine, 'document')),
    );
  }

  processMedicineDetailWithBefore(
    medicine: Prisma.medicineCreateInput,
    before?: medicine | null,
  ) {
    if (!before) return medicine;
    const { image_url, product_type, ingredients, company_serial_number } =
      before;
    return {
      ...medicine,
      image_url,
      product_type,
      ingredients,
      company_serial_number,
    };
  }

  // -------------------------------------------
  // DB SERVICE
  // -------------------------------------------
  async bulkCheckMedicineDetailExist(
    medicineDetails: Prisma.medicineCreateInput[],
  ) {
    const ids = medicineDetails.map(({ id }) => id);
    const existMedicineDetails = await this.prisma.medicine.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    const existMap = new Map(
      existMedicineDetails.map((medicine) => [medicine.id, medicine]),
    );

    return medicineDetails.map((medicine) => {
      const existMedicine = existMap.get(medicine.id);
      return {
        medicine,
        before: existMedicine,
      };
    });
  }

  bulkUpsertMedicineDetail(medicines: Prisma.medicineCreateInput[]) {
    const upsertMedicines = medicines.map((medicine) => {
      const { id, ...rest } = medicine;
      return this.prisma.medicine.upsert({
        where: {
          id,
        },
        create: medicine,
        update: rest,
      });
    });
    return this.prisma.$transaction(upsertMedicines);
  }

  bulkCheckAndUpsertMedicineDetails(
    medicineDetails: Prisma.medicineCreateInput[],
  ) {
    return from(medicineDetails).pipe(
      bufferCount(100),
      mergeMap((medicines) =>
        from(this.bulkCheckMedicineDetailExist(medicines)).pipe(
          mergeMap((m) => m),
          map(({ medicine, before }) =>
            this.processMedicineDetailWithBefore(medicine, before),
          ),
          toArray(),
          delay(2000),
        ),
      ),
      mergeMap((medicines) => this.bulkUpsertMedicineDetail(medicines)),
    );
  }

  // -------------------------------------------
  // UTILS
  // -------------------------------------------
  formatDate(dateString?: string | null) {
    return dateString
      ? new Date(dateString.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'))
      : null;
  }

  parseStandardCode(code?: string | null) {
    return code ? code.split(',').map((code) => code.trim()) : [];
  }

  parseIngredients(
    ingredientsStr?: string | null,
    englishIngredientsStr?: string | null,
  ): Medicine.Ingredient[] {
    // ingredientsStr example
    // 총량 : 1000밀리리터|성분명 : 포도당|분량 : 50|단위 : 그램|규격 : USP|성분정보 : |비고 : ;
    // 총량 : 1000밀리리터|성분명 : 염화나트륨|분량 : 9|단위 : 그램|규격 : KP|성분정보 : |비고 :

    // englishIngredientsStr example
    // Glucose / Sodium Chloride
    if (!ingredientsStr) return [];
    const ingredientSeparator = ' ;';
    const detailSeparator = '|';
    const keyValueSeparator = ' : ';

    const ingredientsString = ingredientsStr.split(ingredientSeparator);
    const englishIngredientsString = (
      englishIngredientsStr?.split('/') || []
    ).map((s) => s.trim());

    return ingredientsString
      .map((ingredient, i) => {
        const details = ingredient.split(detailSeparator);
        const parsedDetails = details.map((detail) =>
          (detail.split(keyValueSeparator)[1] ?? '').trim(),
        );
        const [standard, ko, amount, unit, pharmacopoeia] = parsedDetails;
        const en = englishIngredientsString[i] || '';
        return {
          standard,
          ko,
          en,
          amount,
          unit,
          pharmacopoeia: pharmacopoeia as Medicine.Pharmacopoeia,
        };
      })
      .filter(({ ko }) => ko);
  }

  parseCompounds(compoundsStr?: string | null): Medicine.Compound[] {
    // "[M040702]포도당|[M040426]염화나트륨",
    if (!compoundsStr) return [];

    const compounds = compoundsStr.split('|');
    const compoundRegex = /\[(?<code>[A-Z0-9]+)\](?<name>.+)/;
    return compounds
      .map((compound) => {
        const { code, name } = compound.match(compoundRegex)?.groups ?? {};
        return {
          code,
          name,
        };
      })
      .filter(({ code }) => code);
  }

  parseChangedContents(changedContentsStr?: string | null) {
    //성상, 2021-08-20/
    //성상변경, 2019-07-30/
    //사용상주의사항변경(부작용포함), 2019-01-07/
    //저장방법 및 유효기간(사용기간)변경, 1998-08-20/
    //저장방법 및 유효기간(사용기간)변경, 1998-03-30/
    //저장방법 및 유효기간(사용기간)변경, 1998-02-28
    if (!changedContentsStr) return [];
    const changedContents = changedContentsStr.split('/');
    return changedContents
      .map((changedContent) => {
        const [content, date] = changedContent.split(',');
        return {
          date: date && new Date(date.trim()),
          content,
        };
      })
      .filter(({ content, date }) => content && date);
  }

  parseReExaminations(
    reExaminationsStr?: string | null,
    periodStr?: string | null,
  ): Medicine.ReExamination[] {
    // "reExaminationsStr": "재심사대상(6년),재심사대상(6년),재심사대상(6년),재심사대상(6년)",
    // "periodStr": "2018-12-26~2024-12-25,2018-12-26~2024-12-25,~2024-12-25,~2024-12-25",
    if (!reExaminationsStr || !periodStr) return [];

    const reExaminations = reExaminationsStr.split(',');
    const periods = periodStr.split(',');

    return reExaminations
      .map((type, i) => {
        const preiod = periods[i];
        if (!preiod) return undefined;
        const [start, end] = preiod.split('~');
        if (!end) return undefined;
        return {
          type,
          re_examination_start_date: start ? new Date(start.trim()) : null,
          re_examination_end_date: new Date(end.trim()),
        };
      })
      .filter(Boolean) as Medicine.ReExamination[];
  }

  // -------------------------------------------
  // MARKUP LANGUAGE PARSER
  // -------------------------------------------
  extractDocFromML(text?: string | null) {
    let depth = 0;
    let result = '';
    if (!text) return '';

    const handleAttribs = (attribs: any) => {
      if (attribs.title || attribs['#text']) {
        result += '\t'.repeat(depth) + (attribs.title || attribs['#text']);
      }
    };
    const parser = new Parser(
      {
        onopentag: (name, attribs) => {
          handleAttribs(attribs);
          depth++;
        },
        ontext: (text) => {
          if (!text) depth--;
          if (text)
            result += '\t'.repeat(depth) + text.replaceAll(/<[^>]*>/g, '');
        },
        onclosetag: () => {
          depth--;
        },
      },
      { decodeEntities: true, xmlMode: true },
    );

    parser.write(text);
    parser.end();

    return result;
  }
}
