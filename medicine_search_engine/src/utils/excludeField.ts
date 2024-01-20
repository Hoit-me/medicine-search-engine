import typia from 'typia';

export const selectAll = <T>() => {
  const a = typia.random<Record<keyof T, true>>();
  return a;
};

export type SelectAll<T> = Record<keyof T, true>;
