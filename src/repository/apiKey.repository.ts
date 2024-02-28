import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class ApiKeyRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    {
      key,
      user_id,
      name = 'default',
    }: { key: string; user_id: string; name?: string },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).api_key.create({
      data: {
        key,
        name,
        user_id,
      },
    });
  }

  softDelete(user_id: string, key: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).api_key.update({
      where: {
        user_id,
        key,
      },
      data: {
        status: 'DELETED',
        deleted_at: new Date(),
      },
    });
  }

  delete(user_id: string, key: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).api_key.delete({
      where: {
        user_id,
        key,
      },
    });
  }

  getDetail(user_id: string, key: string, tx?: PrismaTxType) {
    const include: Prisma.api_keyFindManyArgs['include'] = {
      api_key_monthly_usage: {
        select: {
          year: true,
          month: true,
          usage: true,
        },
        include: {
          logs: {
            select: {
              url: true,
              method: true,
              http_status: true,
              date: true,
            },
          },
        },
      },
    };

    return (tx ?? this.prisma).api_key.findUnique({
      where: {
        user_id,
        key,
      },
      include,
    });
  }

  getList(
    {
      user_id,
      year,
      month,
    }: {
      user_id: string;
      year: number;
      month: number;
    },
    tx?: PrismaTxType,
  ) {
    const include: Prisma.api_keyFindManyArgs['include'] = {
      api_key_monthly_usage: {
        select: {
          year: true,
          month: true,
          usage: true,
        },
        where: {
          year,
          month,
        },
      },
    };

    return (tx ?? this.prisma).api_key.findMany({
      where: {
        user_id,
      },
      include,
    });
  }

  update(
    user_id: string,
    key: string,
    input: Omit<Prisma.api_keyUpdateInput, 'key' | 'id' | 'user_id'>,
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).api_key.update({
      where: {
        user_id,
        key,
      },
      data: input,
    });
  }

  checkExist(key: string, tx?: PrismaTxType) {
    return (tx ?? this.prisma).api_key.findUnique({
      where: {
        key,
      },
    });
  }
}
