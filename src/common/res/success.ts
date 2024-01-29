import { SUCCESS } from '@src/type/success';

export const generateResponse = <T>(
  result: T,
  message: string = 'SUCCESS',
): SUCCESS<T> => ({
  is_success: true,
  message,
  result,
});
