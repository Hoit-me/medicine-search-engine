import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { UserError } from '@src/constant/error/user.error';
import { left, right } from 'fp-ts/lib/Either';
import { UserRepository } from './../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async checkEmailExists(email: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(email, tx);
    if (user) {
      return left(UserError.EMAIL_ALREADY_EXISTS);
    }
    return right(null);
  }
  async checkNicknameExists(nickname: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(nickname, tx);
    if (user) {
      return left(UserError.NICKNAME_ALREADY_EXISTS);
    }
    return right(null);
  }

  async createUser(user: Prisma.userCreateInput, tx?: PrismaTxType) {
    return await this.userRepository.create(user, tx);
  }
}
