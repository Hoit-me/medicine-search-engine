import * as XLSX from 'xlsx';

/**
 * 테스트용 xlsx buffer를 생성
 *
 * testHeader, testHeader2
 * test, test2
 * 2test, 2test2
 *
 * @returns [buffer, expected]
 */
export const createTestXslxBufferAndExpected = () => {
  const arrayData = [
    ['testHeader', 'testHeader2'],
    ['test', 'test2'],
    ['2test', '2test2'],
  ];
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(arrayData);

  XLSX.utils.book_append_sheet(workbook, worksheet, 'sheet1');

  const xlsxBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
  });

  const expected = [
    { testHeader: 'test', testHeader2: 'test2' },
    { testHeader: '2test', testHeader2: '2test2' },
  ];
  return [xlsxBuffer, expected];
};
