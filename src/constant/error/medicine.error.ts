import { HttpStatus } from '@nestjs/common';
import { ERROR } from '@src/type/error';
import typia from 'typia';

export namespace MedicineError {
  export type NOT_FOUND = ERROR<
    '의약품을 찾을 수 없습니다.',
    HttpStatus.NOT_FOUND
  >;
  export const NOT_FOUND = typia.random<NOT_FOUND>();
}