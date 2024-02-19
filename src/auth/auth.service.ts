import { Injectable } from '@nestjs/common';
import { MailService } from '@src/common/mail/mail.service';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { EmailError } from '@src/constant/error/email.error';
import { UserRepository } from '@src/repository/user.repository';
import { EmailCertificationRepository } from '../repository/emailCertification.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly emailCertificationRepository: EmailCertificationRepository,
    private readonly userRepository: UserRepository,
  ) {}

  private randomCode() {
    /// 000000 ~ 999999
    return Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
  }

  async sendEmailVerificationCode(
    email: string,
    type: 'SIGN_UP' | 'FIND_PASSWORD' = 'SIGN_UP',
  ) {
    return await this.prisma.$transaction(async (tx) => {
      // 이미 가입된 이메일인지 확인
      const existsUser = await this.userRepository.findUnique(email, tx);
      if (existsUser) {
        return EmailError.EMAIL_ALREADY_EXISTS;
      }

      // 기존 인증번호 상태를 만료 처리
      const exists = await this.emailCertificationRepository.findMany(
        { email, type, date: new Date() },
        tx,
      );
      if (exists.length >= 5) {
        return EmailError.EMAIL_CERTIFICATION_SEND_LIMIT_EXCEEDED;
      }

      const code = this.randomCode();
      await this.emailCertificationRepository.updateMany(
        { email, status: 'EXPIRED', type },
        tx,
      );
      await this.emailCertificationRepository.create({ email, code, type }, tx);
      // TODO: 이벤트로 분리: 응답시간을 줄이기 위해 비동기로 처리
      await this.mailService.send({
        to: email,
        subject: '이메일 인증번호',
        text: `인증번호: ${code}`,
        html: `<p>인증번호: ${code}</p>`,
      });
      return true;
    });
  }
}
