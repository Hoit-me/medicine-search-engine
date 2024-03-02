import { AuthError } from '@src/constant/error/auth.error';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
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
  ): Promise<Either<UserError.INVALID_PASSWORD, boolean>>;
}

export interface BasicAuthService {
  signup(
    dto: Auth.SignupDto,
  ): Promise<
    Either<
      | UserError.EMAIL_ALREADY_EXISTS
      | UserError.NICKNAME_ALREADY_EXISTS
      | EmailError.EMAIL_CERTIFICATION_NOT_VERIFIED
      | AuthError.OAUTH.SOCIAL_ACCOUNT_LINKING_FAILED
      | AuthError.OAUTH.SOCIAL_AUTH_FAILED
      | AuthError.OAUTH.SOCIAL_AUTH_INFO_MISSING
      | AuthError.OAUTH.SOCIAL_SERVICE_ACCESS_DENIED
      | AuthError.OAUTH.SOCIAL_SERVICE_RESPONSE_ERROR
      | AuthError.OAUTH.SOCIAL_ACCOUNT_ALREADY_LINKED,
      { email: string }
    >
  >;

  login(
    dto: Auth.LoginDto,
  ): Promise<
    Either<
      UserError.NOT_FOUND_USER | UserError.INVALID_PASSWORD,
      { access_token: string; refresh_token: string; payload: JwtPayload }
    >
  >;
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
