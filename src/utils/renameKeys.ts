// export const renameKeys = <T extends object>(
//   keysMap: T,
//   arg: [keyof T, string][],
//   opt?: {
//     undefinedToNull?: boolean;
//   },
// ) => {
//   const temp: any = { ...keysMap };

//   arg.forEach(([oldKey, newKey]) => {
//     if (oldKey in temp) {
//       temp[newKey] = temp[oldKey];
//       delete temp[oldKey];
//     } else if (opt && opt.undefinedToNull) {
//       temp[newKey] = null;
//     }
//   });
//   return temp as { [key: string]: any };
// };
export type TypedRenameKeys<T extends object, M extends [keyof T, string][]> = {
  [K in M[number][1]]: Extract<M[number], [string, K]> extends [infer O, K]
    ? O extends keyof T
      ? undefined extends T[O] // 선택적 키인지 검사
        ? T[O] | undefined // 선택적 상태 유지
        : T[O] // 필수 키인 경우
      : never
    : never;
} & {
  [K in Exclude<keyof T, M[number][0]>]: T[K] extends undefined
    ? undefined
    : T[K];
};
export const renameKeys = <T extends object, M extends [keyof T, string][]>(
  keysMap: T,
  arg: M,
  opt?: {
    undefinedToNull?: boolean;
  },
): TypedRenameKeys<T, M> => {
  const temp: any = { ...keysMap };

  arg.forEach(([oldKey, newKey]) => {
    if (oldKey in temp) {
      temp[newKey] = temp[oldKey];
      delete temp[oldKey];
    } else if (opt?.undefinedToNull) {
      temp[newKey] = null;
    }
  });

  return temp as TypedRenameKeys<T, M>;
};
