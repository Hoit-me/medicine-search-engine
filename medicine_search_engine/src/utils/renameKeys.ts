export const renameKeys = <T extends object>(
  keysMap: T,
  arg: [keyof T, string][],
  opt?: {
    undefinedToNull?: boolean;
  },
) => {
  const temp: any = { ...keysMap };

  arg.forEach(([oldKey, newKey]) => {
    if (oldKey in temp) {
      temp[newKey] = temp[oldKey];
      delete temp[oldKey];
    } else if (opt && opt.undefinedToNull) {
      temp[newKey] = null;
    }
  });
  return temp as { [key: string]: any };
};
