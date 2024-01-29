export type HasKey<T extends string> = {
  [key in T]?: string | null;
};
