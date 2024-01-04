import * as XLSX from 'xlsx';

export const convertXlsxToJson = <T>(buffer: any): T => {
  const xlsx = XLSX.read(buffer);
  const sheetName = xlsx.SheetNames[0];
  const sheet = xlsx.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json(sheet);
  return json as T;
};
