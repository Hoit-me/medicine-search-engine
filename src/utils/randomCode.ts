export const randomCode = () => {
  /// 000000 ~ 999999
  return Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
};
