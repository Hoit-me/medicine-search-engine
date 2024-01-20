export const DETAIL_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnDtlInq03?type=json`;
export const DETAIL_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DETAIL_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const COMMON_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnInq04?type=json`;
export const COMMON_API_URL_BUILD = (pageNo: number, rows = 100) =>
  COMMON_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const MEDICINE_IMAGE_BUCKET_FOLDER = 'medicines';

export const DUR_COMBINED_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02?typeName=병용금기&type=json';
export const DUR_COMBINED_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_COMBINED_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_AGE_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getSpcifyAgrdeTabooInfoList02?typeName=특정연령대금기&type=json';
export const DUR_AGE_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_AGE_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_PREGNAT_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getPwnmTabooInfoList02?typeName=임부금기&type=json&';
export const DUR_PREGNAT_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_PREGNAT_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_VOLUME_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getCpctyAtentInfoList02?typeName=용량주의&type=json';
export const DUR_VOLUME_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_VOLUME_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

// 기간
export const DUR_PERIOD_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getMdctnPdAtentInfoList02?typeName=투여기간주의&type=json';
export const DUR_PERIOD_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_PERIOD_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

// 노인주의

export const DUR_OLD_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getOdsnAtentInfoList02?typeName=노인주의&type=json';

export const DUR_OLD_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUR_OLD_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUPLICATE_EFFECT_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getEfcyDplctInfoList02?typeName=효능군중복&type=json';
export const DUPLICATE_EFFECT_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DUPLICATE_EFFECT_API_URL +
  `&serviceKey=${process.env.API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const INSURANCE_API_URL =
  'https://api.odcloud.kr/api/15067459/v1/uddi:b423e584-1da2-4f74-8789-bb2632372aef?returnType=json';

export const INSURANCE_API_URL_BUILD = (pageNo: number, rows = 100) =>
  INSURANCE_API_URL +
  `&page=${pageNo}&perPage=${rows}&serviceKey=${process.env.API_KEY_DECODED}`;

export const IDENTIFICATION_API_URL =
  'https://apis.data.go.kr/1471000/MdcinGrnIdntfcInfoService01/getMdcinGrnIdntfcInfoList01?type=json';
export const IDENTIFICATION_API_URL_BUILD = (pageNo: number, rows = 100) =>
  IDENTIFICATION_API_URL +
  `&serviceKey=${process.env.API_KEY_DECODED}&pageNo=${pageNo}&numOfRows=${rows}`;

export const INGREDIENT_API_URL =
  'https://api.odcloud.kr/api/15067461/v1/uddi:0885e8ce-ef4d-45ee-8301-861fd4d886bc?returnType=json';
export const INGREDIENT_API_URL_BUILD = (pageNo: number, rows = 100) =>
  INGREDIENT_API_URL +
  `&page=${pageNo}&perPage=${rows}&serviceKey=${process.env.API_KEY_DECODED}`;

export const DISEASE_API_URL =
  'https://api.odcloud.kr/api/15067467/v1/uddi:242b4301-d660-495d-b409-a3fe8fd3a03a?returnType=json';
export const DISEASE_API_URL_BUILD = (pageNo: number, rows = 100) =>
  DISEASE_API_URL +
  `&page=${pageNo}&perPage=${rows}&serviceKey=${process.env.API_KEY_DECODED}`;
