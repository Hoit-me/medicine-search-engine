import { Module } from '@nestjs/common';
import { MailModule } from '@src/common/mail/mail.module';
import { EmailCertificationRepository } from '@src/repository/emailCertification.repository';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { UserModule } from './user.module';

@Module({
  imports: [MailModule, UserModule],
  providers: [EmailCertificationRepository, EmailCertificationService],
  exports: [EmailCertificationService],
})
export class EmailCertificationModule {}
