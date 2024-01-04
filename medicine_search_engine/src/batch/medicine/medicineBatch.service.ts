import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { medicine } from '@prisma/client';
import { Medicine } from '@src/type/medicine';
import { convertXlsxToJson } from '@src/utils/convertXlsxToJson';
import { renameKeys } from '@src/utils/renameKeys';
import { catchError, from, map, mergeMap } from 'rxjs';

@Injectable()
export class MedicineBatchService {
  logger = console;
  constructor(private readonly httpService: HttpService) {}

  save(medicine: medicine) {
    return medicine;
  }

  processMedicineDetail() {
    const url =
      'https://nedrug.mfds.go.kr/pbp/CCBBA01/getItemDetailExcelList?itemSeq=202003016';
    return this.fetchMedicineDetailListXlsx(url).pipe(
      map(this.convertMedicineDetailListXlsxToJson),
      mergeMap(from),
      map(this.converMedicineDetailKeyKrToEng),
      map(this.convertFormatMedicineDetailToDBSchema),
      map(this.save),
      catchError((err) => {
        this.logger.error(err.message);
        return 'ERROR';
      }),
    );
  }

  fetchMedicineDetailListXlsx(url: string) {
    return this.httpService
      .get(url, {
        responseType: 'arraybuffer',
      })
      .pipe(map((res) => res.data));
  }

  convertMedicineDetailListXlsxToJson(buffer: any) {
    return convertXlsxToJson<Medicine.DetailJson_Kr[]>(buffer);
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
    const { document, usage, effect, caution, ...rest } = medicine;
    return {
      ...rest,
      id: medicine.serial_number,
      type: medicine.type as medicine['type'],
      cancel_date: medicine.cancel_date ? new Date(medicine.cancel_date) : null,
      change_date: medicine.change_date ? new Date(medicine.change_date) : null,
      permit_date: medicine.permit_date ? new Date(medicine.permit_date) : null,
      classification: medicine.classification as medicine['classification'],
      ingredients: this.parseIngredients(
        medicine.ingredients,
        medicine.english_ingredients,
      ),
      main_ingredient: this.parseCompound(medicine.main_ingredient),
      additive: this.parseCompound(medicine.additive),
      document_file_url: document || null,

      expiration_date: medicine.expiration_date
        ? new Date(medicine.expiration_date)
        : null,
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
      re_examination_date: medicine.re_examination_date
        ? new Date(medicine.re_examination_date)
        : null,
      re_examination: this.parseReExamination(medicine.re_examination),
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
    // standard | ko | Pharmacoepia | amount | unit
    // amount : amunt + unit
    // ko : ko

    const korIngredients = ingredients.split(';');
    const engIngredients = english_ingredients?.split('/') || [];

    const _ingredients = korIngredients.map((kor, index) => {
      const [standard, ko, pharmacoepia, amount, unit] = kor.split('|');
      const en = engIngredients[index] || null;

      return {
        standard,
        ko,
        en,
        pharmacopeia: pharmacoepia as Medicine.Pharmacoepia,
        amount,
        unit,
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
        date: new Date(date),
      };
    });
    return _changeContents;
  }

  parseReExamination(reExaminationString: string | null) {
    if (!reExaminationString) return null;
    // "type: 신규, re_examination_start_date: 2021-08-27, re_examination_end_date: 2021-08-27"
    const [type, re_examination_start_date, re_examination_end_date] =
      reExaminationString.split('~');
    return {
      type,
      re_examination_start_date: new Date(re_examination_start_date),
      re_examination_end_date: new Date(re_examination_end_date),
    };
  }
}
