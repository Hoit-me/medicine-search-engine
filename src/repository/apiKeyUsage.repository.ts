import { Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class ApiKeyUsageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMonthlyUsage(
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

  async getMonthlyUsage(
    key: string,
    year: number,
    month: number,
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.findFirst({
      where: { key, year, month },
    });
  }

  async incrementMonthlyUsage(
    key: string,
    year: number,
    month: number,
    tx?: PrismaTxType,
  ) {
    return await (tx ?? this.prisma).api_key_monthly_usage.update({
      where: { key_year_month: { key, year, month } },
      data: { usage: { increment: 1 } },
    });
  }
  6;
}
