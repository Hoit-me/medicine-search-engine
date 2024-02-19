import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    return (tx ?? this.prisma).user.create({
      data: input,
    });
  }
}
