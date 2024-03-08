import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';

@Injectable()
export class UserLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: Prisma.user_logUncheckedCreateInput) {
    return this.prisma.user_log.create({
      data: input,
    });
  }
}
