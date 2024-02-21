import { JwtOption } from './interface/option.interface';

export const jwtOption: JwtOption = {
  access_secret: (process.env.JWT_ACCESS_SECRET as string) || 'access_secret',
  refresh_secret:
    (process.env.JWT_REFRESH_SECRET as string) || 'refresh_secret',
  access_expires_in: (process.env.JWT_ACCESS_EXPIRES_IN as string) || '1h',
  refresh_expires_in: (process.env.JWT_REFRESH_EXPIRES_IN as string) || '14d',
};

export const passwordOption = {
  salt: (process.env.PASSWORD_SALT as string) || 10,
};
