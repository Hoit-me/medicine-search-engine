import { Injectable } from '@nestjs/common';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { EmailError } from '@src/constant/error/email.error';
import { left, right } from 'fp-ts/lib/Either';
import { UserRepository } from './../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async checkUserExists(email: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(email, tx);
    if (user) {
      return left(EmailError.EMAIL_ALREADY_EXISTS);
    }
    return right(null);
  }
}
