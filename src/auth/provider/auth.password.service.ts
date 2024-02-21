import { Inject, Injectable } from '@nestjs/common';
import { PasswordOption } from '@src/config/interface/option.interface';
import * as bcrypt from 'bcrypt';
import { BasicAuthPasswordService } from '../auth.interface';
import { PASSWORD_OPTIONS } from '../constant';

@Injectable()
export class AuthPasswordService implements BasicAuthPasswordService {
  constructor(
    @Inject(PASSWORD_OPTIONS)
    private readonly option: PasswordOption,
  ) {}
  async hash(password: string): Promise<string> {
    const hashedPassword = bcrypt.hash(password, this.option.salt);
    return hashedPassword;
  }
  async compare(password: string, hashed: string): Promise<boolean> {
    const isMatch = bcrypt.compare(password, hashed);
    return isMatch;
  }
}
