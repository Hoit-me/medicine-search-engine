export const DETAIL_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnDtlInq03?type=json`;
export const COMMON_API_URL = `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnInq04?type=json`;

export const DETAIL_API_URL_BUILD = (API_KEY: string, pageNo: number) =>
  DETAIL_API_URL + `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=50`;
//   `https://apis.data.go.kr/1471000/DrugPrdtPrmsnInfoService04/getDrugPrdtPrmsnDtlInq03?serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=100&type=json`;

export const COMMON_API_URL_BUILD = (API_KEY: string, pageNo: number) =>
  COMMON_API_URL + `&serviceKey=${API_KEY}&pageNo=${pageNo}&numOfRows=100`;

export const MEDICINE_IMAGE_BUCKET_FOLDER = 'medicines';
