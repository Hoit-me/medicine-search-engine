import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace MedicineError {
  // 약이 존재하지 않는 경우
  export type NOT_FOUND = ERROR<'MEDICINE_NOT_FOUND', HttpStatus.NOT_FOUND>;
  export const NOT_FOUND = typia.random<NOT_FOUND>();
}
