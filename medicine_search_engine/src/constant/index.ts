export const DETAIL_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnDtlInq03?type=json`;
export const DETAIL_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DETAIL_API_URL + `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const COMMON_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnInq04?type=json`;
export const COMMON_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  COMMON_API_URL + `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const MEDICINE_IMAGE_BUCKET_FOLDER = 'medicines';

export const DUR_COMBINED_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getUsjntTabooInfoList02?typeName=병용금기&type=json';
export const DUR_COMBINED_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DUR_COMBINED_API_URL +
  `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_AGE_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getSpcifyAgrdeTabooInfoList02?typeName=특정연령대금기&type=json';
export const DUR_AGE_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DUR_AGE_API_URL + `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_PREGNAT_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getPwnmTabooInfoList02?typeName=임부금기&type=json&';
export const DUR_PREGNAT_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DUR_PREGNAT_API_URL +
  `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

export const DUR_VOLUME_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getCpctyAtentInfoList02?typeName=용량주의&type=json';
export const DUR_VOLUME_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DUR_VOLUME_API_URL +
  `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;

// 기간
export const DUR_PERIOD_API_URL =
  'https://apis.data.go.kr/1471000/DURIrdntInfoService03/getMdctnPdAtentInfoList02?typeName=투여기간주의&type=json';
export const DUR_PERIOD_API_URL_BUILD = (
  API_KEY: string,
  pageNo: number,
  rows = 100,
) =>
  DUR_PERIOD_API_URL +
  `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=${rows}`;
