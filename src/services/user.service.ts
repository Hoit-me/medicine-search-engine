import { Injectable } from '@nestjs/common';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { UserError } from '@src/constant/error/user.error';
import { Auth } from '@src/type/auth.type';
import { left, right } from 'fp-ts/lib/Either';
import { UserRepository } from './../repository/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findUnique(email: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(email, tx);
    if (!user) return left(UserError.NOT_FOUND_USER);
    return right(user);
  }

  async findSocialId(
    dto: {
      social_id: string;
      provider: Auth.Oauth.Provider;
    },
    tx?: PrismaTxType,
  ) {
    const social_info = await this.userRepository.findUniqueSocialId(dto, tx);
    if (!social_info) {
      return left(UserError.NOT_FOUND_USER_SOCIAL_INFO);
    }
    return right(social_info);
  }

  async findEmail(email: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(email, tx);
    if (!user) return left(UserError.NOT_FOUND_USER);
    return right(user);
  }

  async findNickName(nickname: string, tx?: PrismaTxType) {
    const user = await this.userRepository.findUnique(nickname, tx);
    if (!user) return left(UserError.NOT_FOUND_USER);
    return right(user);
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

  async createSocialUser(
    user: { email: string; nickname: string },
    social_info: { social_id: string; provider: Auth.Oauth.Provider },
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
    {
      social_id,
      provider,
    }: { social_id: string; provider: Auth.Oauth.Provider },
    tx?: PrismaTxType,
  ) {
    return await this.userRepository.createSocialInfo(
      user_id,
      { social_id, provider },
      tx,
    );
  }

  async updatePassword(email: string, password: string, tx?: PrismaTxType) {
    return await this.userRepository.updatePassword(email, password, tx);
  }
}
