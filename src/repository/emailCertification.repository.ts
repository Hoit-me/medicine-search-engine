import { Injectable } from '@nestjs/common';
import {
  CERTIFICATION_STATUS,
  CERTIFICATION_TYPE,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';

@Injectable()
export class EmailCertificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(
    {
      email,
      date,
      status = 'PENDING',
      type = 'SIGN_UP',
      code,
    }: {
      email: string;
      date?: {
        gte: Date;
        lte: Date;
      };
      type?: CERTIFICATION_TYPE;
      status?: CERTIFICATION_STATUS;
      code?: string;
    },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.findMany({
      where: {
        email,
        type,
        ...(date && {
          created_at: date,
        }),
        ...(status && { status }),
        ...(code && { code }),
      },
    });
  }

  findFirst(
    {
      email,
      date,
      status = 'PENDING',
      type = 'SIGN_UP',
      code,
    }: {
      email: string;
      date?: {
        gte: Date;
        lte: Date;
      };
      type?: CERTIFICATION_TYPE;
      status?: CERTIFICATION_STATUS;
      code?: string;
    },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.findFirst({
      where: {
        email,
        type,
        status,
        code,
        ...(date && {
          created_at: date,
        }),
      },
    });
  }

  updateMany(
    {
      where,
      data,
    }: {
      where: Prisma.email_certificationWhereInput;
      data: {
        status: CERTIFICATION_STATUS;
      };
    },
    tx?: PrismaTxType,
  ) {
    return (tx ?? this.prisma).email_certification.updateMany({
      where,
      data,
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
