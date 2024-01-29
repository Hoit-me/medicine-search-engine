import { Page } from '@src/type/page';
import { SUCCESS } from '@src/type/success';

export const generateResponse = <T>(
  result: T,
  message: string = 'SUCCESS',
): SUCCESS<T> => ({
  is_success: true,
  message,
  result,
});

export const generatePagedResponse = <T>(
  result: T[],
  pagenation: Page.Pagenation,
  message: string = 'SUCCESS',
): Page<T> => ({
  is_success: true,
  message,
  result: {
    data: result,
    pagenation,
  },
});
