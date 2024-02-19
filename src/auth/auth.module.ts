import { Module } from '@nestjs/common';
import { MailModule } from '@src/common/mail/mail.module';
import { UserRepository } from '@src/repository/user.repository';
import { EmailCertificationRepository } from '../repository/emailCertification.repository';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, EmailCertificationRepository, UserRepository],
})
export class AuthModule {}
