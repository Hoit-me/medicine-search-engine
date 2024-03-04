import { Inject, Injectable } from '@nestjs/common';
import { PasswordOption } from '@src/config/interface/option.interface';
import { AuthError } from '@src/constant/error/auth.error';
import * as bcrypt from 'bcrypt';
import { left, right } from 'fp-ts/lib/Either';
import { BasicAuthPasswordService } from '../auth.interface';
import { PASSWORD_OPTIONS } from '../constant';

@Injectable()
export class AuthPasswordService implements BasicAuthPasswordService {
  constructor(
    @Inject(PASSWORD_OPTIONS)
    private readonly option: PasswordOption,
  ) {}
  async hash(password: string) {
    const hashedPassword = bcrypt.hash(password, this.option.salt);
    return hashedPassword;
  }
  async compare(password: string, hashed: string) {
    const isMatch = bcrypt.compare(password, hashed);
    if (!isMatch) return left(AuthError.INVALID_PASSWORD);
    return right(true);
  }
}
