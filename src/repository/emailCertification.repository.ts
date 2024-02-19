import { Injectable } from '@nestjs/common';
import { CERTIFICATION_STATUS, CERTIFICATION_TYPE } from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class EmailCertificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(
    {
      email,
      date,
      type = 'SIGN_UP',
    }: { email: string; date?: Date; type?: CERTIFICATION_TYPE },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.findMany({
      where: {
        email,
        type,
        ...(date && {
          created_at: {
            // 00:00:00 ~ 23:59:59
            gte: new Date(date.setHours(0, 0, 0, 0)),
            lte: new Date(date.setHours(23, 59, 59, 999)),
          },
        }),
      },
    });
  }

  updateMany(
    {
      email,
      status,
      type = 'SIGN_UP',
    }: {
      email: string;
      status: CERTIFICATION_STATUS;
      type?: CERTIFICATION_TYPE;
    },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.updateMany({
      where: { email, type },
      data: { status },
    });
  }

  create(
    {
      email,
      code,
      type = 'SIGN_UP',
    }: { email: string; code: string; type?: CERTIFICATION_TYPE },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.create({
      data: {
        email,
        code,
        type,
      },
    });
  }
}
