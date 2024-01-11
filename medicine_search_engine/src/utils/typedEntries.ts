export type TypedEntries = <T extends Record<any, any>>(
  record: T,
) => {
  [K in keyof T]: [K, T[K]];
}[keyof T][];
export const typedEntries: TypedEntries = (record) =>
  Object.entries(record) as any;
