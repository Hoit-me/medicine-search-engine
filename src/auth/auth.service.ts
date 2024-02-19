import { Injectable } from '@nestjs/common';
import { MailService } from '@src/common/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private readonly mailService: MailService) {}

  async emailCertification(email: string) {
    // 이메일 인증번호 발송
    this.mailService.send({
      to: email,
      subject: '이메일 인증번호',
      text: '인증번호: 1234',
      html: '<p>인증번호: 1234</p>',
    });
  }
}
