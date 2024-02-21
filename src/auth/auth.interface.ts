import { user } from '@prisma/client';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { Auth } from '@src/type/auth';
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
  compare(password: string, hashed: string): Promise<boolean>;
}

export interface BasicAuthService {
  signup(
    dto: Auth.SignupDto,
  ): Promise<
    Either<
      | UserError.EMAIL_ALREADY_EXISTS
      | UserError.NICKNAME_ALREADY_EXISTS
      | EmailError.EMAIL_CERTIFICATION_NOT_VERIFIED,
      Pick<user, 'email'>
    >
  >;

  login(): Promise<void>;
}
