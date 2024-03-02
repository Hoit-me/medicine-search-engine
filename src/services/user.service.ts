import { Injectable } from '@nestjs/common';
import { OAUTH_PROVIDER } from '@prisma/client';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { AuthError } from '@src/constant/error/auth.error';
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

  async createUser(
    user: {
      email: string;
      nickname: string;
      password: string;
    },
    tx?: PrismaTxType,
  ) {
    return await this.userRepository.create(user, tx);
  }

  async findUnique(email: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(email, tx);
    if (!user) return left(UserError.NOT_FOUND_USER);
    return right(user);
  }

  async checkSocialIdExists(
    dto: {
      social_id: string;
      provider: OAUTH_PROVIDER;
    },
    tx?: PrismaTxType,
  ) {
    const social_info = await this.userRepository.findUniqueSocialId(dto, tx);
    if (social_info) {
      return left(AuthError.OAUTH.SOCIAL_ACCOUNT_ALREADY_LINKED);
    }
    return right(social_info);
  }

  async createSocialUser(
    user: { email: string; nickname: string },
    social_info: { social_id: string; provider: OAUTH_PROVIDER },
    tx?: PrismaTxType,
  ) {
    return await this.userRepository.create(
      {
        email: user.email,
        nickname: user.nickname,
        user_social: {
          create: social_info,
        },
      },
      tx,
    );
  }

  async createSocialInfo(
    user_id: string,
    { social_id, provider }: { social_id: string; provider: OAUTH_PROVIDER },
    tx?: PrismaTxType,
  ) {
    return await this.userRepository.createSocialInfo(
      user_id,
      { social_id, provider },
      tx,
    );
  }
}
