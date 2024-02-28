import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class ApiKeyUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    input: {
      key: string;
      year: number;
      month: number;
      monthly_limit: number; // 한달 사용량 제한 - 과금정책 변경시 사용될 예정
    },
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.create({
      data: { ...input, usage: 0 },
    });
  }

  async createMany(
    input: {
      keys: string[];
      year: number;
      month: number;
      monthly_limit: number;
    },
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.createMany({
      data: input.keys.map((key) => ({
        key,
        year: input.year,
        month: input.month,
        monthly_limit: input.monthly_limit,
        usage: 0,
      })),
    });
  }

  async find(
    input: {
      key: string;
      month: number;
      year: number;
    },
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.findUnique({
      where: { key_year_month: input },
    });
  }

  async update(
    where: {
      key: string;
      year: number;
      month: number;
    },
    data: {
      usage: number;
    },
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.update({
      where: { key_year_month: where },
      data,
    });
  }

  async findMany(
    keys: string[],
    year: number,
    month: number,
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.findMany({
      where: {
        key: { in: keys },
        year,
        month,
      },
    });
  }
}
