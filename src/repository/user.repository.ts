import { Injectable } from '@nestjs/common';
import { OAUTH_PROVIDER, Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findUnique(email: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).user.findUnique({
      where: { email },
    });
  }

  create(input: Prisma.userCreateInput, tx?: PrismaTxType) {
    console.log(input);
    return (tx ?? this.prisma).user.create({
      data: input,
    });
  }

  findUniqueSocialId(
    input: {
      social_id: string;
      provider: OAUTH_PROVIDER;
    },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).user_social.findUnique({
      where: {
        provider_social_id: {
          provider: input.provider,
          social_id: input.social_id,
        },
      },
      include: {
        user: true,
      },
    });
  }

  createSocialInfo(
    user_id: string,
    social_info: { social_id: string; provider: OAUTH_PROVIDER },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).user_social.create({
      data: {
        user_id,
        social_id: social_info.social_id,
        provider: social_info.provider,
      },
    });
  }
}
