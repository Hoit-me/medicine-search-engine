import { Injectable } from '@nestjs/common';
import { MailService } from '@src/common/mail/mail.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { EmailError } from '@src/constant/error/email.error';
import { UserError } from '@src/constant/error/user.error';
import { EmailCertificationRepository } from '@src/repository/emailCertification.repository';
import { getTodayDateRange } from '@src/utils/getTodayDateRange';
import { randomCode } from '@src/utils/randomCode';
import { Either, isLeft, isRight, left, right } from 'fp-ts/lib/Either';
import { UserService } from './user.service';

@Injectable()
export class EmailCertificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly userService: UserService,
    private readonly emailCertificationRepository: EmailCertificationRepository,
  ) {}

  ///////////////////////////
  // Service functions
  ///////////////////////////
  async sendEmailVerificationCode(
    email: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD' = 'SIGN_UP',
  ): Promise<
    Either<
      | EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED
      | UserError.EMAIL_ALREADY_EXISTS,
      true
    >
  > {
    return await this.prisma.$transaction(async (tx) => {
      const checkUser = await this.userService.findEmail(email, tx);
      if (isRight(checkUser)) return left(UserError.EMAIL_ALREADY_EXISTS);

      // 이메일 인증번호 발송 횟수 확인
      const checkEmailLimit = await this.checkEmailCertificationLimit(
        email,
        type,
        tx,
      );
      if (isLeft(checkEmailLimit)) return checkEmailLimit;
      const code = await this.generateAndSaveEmailCode(email, type, tx);
      await this.sendVerificationEmail(email, code);
      return right(true);
    });
  }

  async verifyEmailCode(
    email: string,
    code: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD' = 'SIGN_UP',
  ): Promise<
    Either<EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH, { id: string }>
  > {
    const result = await this.prisma.$transaction(async (tx) => {
      // TODO: 회원가입시에만 체크하도록 수정
      // const checkUser = await this.userService.findEmail(email, tx);
      // if (isRight(checkUser)) return left(UserError.EMAIL_ALREADY_EXISTS);

      const emailCertification =
        await this.emailCertificationRepository.findFirst(
          {
            email,
            code,
            type,
            date: {
              // 15분 전 ~ 현재
              gte: new Date(new Date().getTime() - 15 * 60 * 1000),
              lte: new Date(),
            },
            status: 'PENDING',
          },
          tx,
        );
      if (!emailCertification) {
        return left(EmailError.EMAIL_CERTIFICATION_CODE_NOT_MATCH);
      }
      await this.emailCertificationRepository.updateMany(
        {
          where: { email, status: 'PENDING', type },
          data: { status: 'VERIFIED' },
        },
        tx,
      );
      return right({ id: emailCertification.id });
    });
    return result;
  }

  async checkEmailCertification(
    {
      id,
      email,
    }: {
      id: string;
      email: string;
    },
    tx?: PrismaTxType,
  ) {
    const check = await this.emailCertificationRepository.findFirst(
      {
        id,
        email,
        status: 'VERIFIED',
      },
      tx,
    );
    if (!check) return left(EmailError.EMAIL_CERTIFICATION_NOT_VERIFIED);
    return right(null);
  }

  ///////////////////////////
  // Batch
  ///////////////////////////
  async deleteExpiredEmailCertification() {
    await this.emailCertificationRepository.updateMany({
      where: {
        status: { in: ['PENDING', 'VERIFIED'] },
        created_at: {
          // 00:00:00 ~ 23:59:59
          lte: getTodayDateRange().startOfDay,
        },
      },
      data: { status: 'EXPIRED' },
    });
  }

  ///////////////////////////
  // Validation functions
  ///////////////////////////
  async checkEmailCertificationLimit(
    email: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD',
    tx?: PrismaTxType,
  ) {
    const { startOfDay, endOfDay } = getTodayDateRange();
    const exists = await this.emailCertificationRepository.findMany(
      {
        email,
        type,
        date: {
          // 00:00:00 ~ 23:59:59
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      tx,
    );
    console.log(exists, 'exists');
    if (exists.length >= 5) {
      return left(EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED);
    }
    return right(null);
  }

  ///////////////////////////
  // Helper functions
  ///////////////////////////
  private async sendVerificationEmail(
    email: string,
    code: string,
  ): Promise<void> {
    this.mailService.send({
      to: email,
      subject: '이메일 인증번호',
      text: `인증번호: ${code}`,
      html: `<p>인증번호: ${code}</p>`,
    });
  }

  private async generateAndSaveEmailCode(
    email: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD',
    tx: PrismaTxType,
  ): Promise<string> {
    const code = randomCode();
    await this.emailCertificationRepository.updateMany(
      {
        where: {
          email,
          status: { in: ['PENDING', 'VERIFIED'] }, // PENDING, VERIFIED 상태인 인증번호는 만료처리
          type,
        },
        data: {
          status: 'EXPIRED',
        },
      },
      tx,
    );
    await this.emailCertificationRepository.create({ email, code, type }, tx);
    return code;
  }
}
