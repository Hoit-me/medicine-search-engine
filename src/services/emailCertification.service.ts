import { Injectable } from '@nestjs/common';
import { MailService } from '@src/common/mail/mail.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PrismaTxType } from '@src/common/prisma/prisma.type';
import { EmailError } from '@src/constant/error/email.error';
import { EmailCertificationRepository } from '@src/repository/emailCertification.repository';
import { randomCode } from '@src/utils/randomCode';
import { Either, isLeft, left, right } from 'fp-ts/lib/Either';
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
      | EmailError.EMAIL_ALREADY_EXISTS,
      true
    >
  > {
    return await this.prisma.$transaction(async (tx) => {
      const checkUser = await this.userService.checkUserExists(email, tx);
      if (isLeft(checkUser)) return checkUser;

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

  ///////////////////////////
  // Validation functions
  ///////////////////////////
  async checkEmailCertificationLimit(
    email: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD',
    tx?: PrismaTxType,
  ) {
    const exists = await this.emailCertificationRepository.findMany(
      { email, type, date: new Date() },
      tx,
    );
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
      { email, status: 'EXPIRED', type },
      tx,
    );
    await this.emailCertificationRepository.create({ email, code, type }, tx);
    return code;
  }
}
