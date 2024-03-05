import { AuthError } from '@src/constant/error/auth.error';
import { Auth } from '@src/type/auth.type';
import { Either } from 'fp-ts/lib/Either';

export interface JwtPayload {
  id: string;
  email: string;
}

export interface BasicAuthJWTService {
  accessTokenSign(payload: JwtPayload): string;
  accessTokenVerify(token: string): JwtPayload;
  refreshTokenSign(payload: JwtPayload): string;
  refreshTokenVerify(toke: string): JwtPayload;
}

export interface BasicAuthPasswordService {
  hash(password: string): Promise<string>;
  compare(
    password: string,
    hashed: string,
  ): Promise<Either<AuthError.Authentication.INVALID_PASSWORD, boolean>>;

  changePassword(
    dto: Auth.ChangePasswordDto,
  ): Promise<
    Either<
      | AuthError.User.USER_NOT_FOUND
      | AuthError.Authentication.INVALID_PASSWORD
      | AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED
      | AuthError.Authentication.INVALID_TYPE,
      { email: string; id: string }
    >
  >;
}

export interface BasicAuthService {
  signup(
    dto: Auth.SignupDto,
  ): Promise<
    Either<
      | AuthError.User.EMAIL_ALREADY_EXISTS
      | AuthError.User.NICKNAME_ALREADY_EXISTS
      | AuthError.Authentication.INVALID_TYPE
      | AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED
      | AuthError.SocialAuth.SOCIAL_ACCOUNT_LINKING_FAILED
      | AuthError.SocialAuth.SOCIAL_AUTH_FAILED
      | AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING
      | AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED
      | AuthError.SocialAuth.SOCIAL_SERVICE_RESPONSE_ERROR
      | AuthError.SocialAuth.SOCIAL_ACCOUNT_ALREADY_LINKED,
      { email: string }
    >
  >;

  login(
    dto: Auth.LoginDto,
  ): Promise<
    Either<
      | AuthError.User.USER_NOT_FOUND
      | AuthError.Authentication.INVALID_TYPE
      | AuthError.Authentication.INVALID_PASSWORD
      | AuthError.SocialAuth.SOCIAL_AUTH_FAILED
      | AuthError.SocialAuth.SOCIAL_AUTH_INFO_MISSING
      | AuthError.SocialAuth.SOCIAL_SERVICE_ACCESS_DENIED,
      { access_token: string; refresh_token: string; payload: JwtPayload }
    >
  >;
}
export interface BasicAuthServiceAdapter extends BasicAuthService {
  changePassword(
    dto: Auth.ChangePasswordDto,
  ): Promise<
    Either<
      | AuthError.User.USER_NOT_FOUND
      | AuthError.Authentication.INVALID_PASSWORD
      | AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED
      | AuthError.Authentication.INVALID_TYPE,
      { email: string; id: string }
    >
  >;

  logout(payload: JwtPayload): Promise<void>;
  refresh(
    payload: JwtPayload,
  ): Promise<{ access_token: string; refresh_token: string }>;
}

export interface BasicAuthCacheService {
  setCache(id: string, token: string): Promise<void>;
  deleteCache(id: string): Promise<void>;
  getCache(id: string): Promise<string | undefined>;
  checkBlacklist(token: string): Promise<boolean>;
  addBlacklist(token: string): Promise<void>;
}

export interface BasicAuthApiKeyCacheService {
  setCache(id: string, date: Date, token: string): Promise<void>;
  increaseCount(id: string, date: Date): Promise<void>;
  getCache(id: string, date: Date): Promise<string | undefined>;
  getCount(id: string): Promise<number>;
  deleteCache(id: string): Promise<void>;
  checkBlacklist(key: string): Promise<boolean>;
  addBlacklist(key: string): Promise<void>;
}
