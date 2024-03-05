import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@src/common/prisma/prisma.service';
import { PasswordOption } from '@src/config/interface/option.interface';
import { AuthError } from '@src/constant/error/auth.error';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth.type';
import * as bcrypt from 'bcrypt';
import { isLeft, left, right } from 'fp-ts/lib/Either';
import { BasicAuthPasswordService } from '../auth.interface';
import { PASSWORD_OPTIONS } from '../constant';

@Injectable()
export class AuthPasswordService implements BasicAuthPasswordService {
  constructor(
    @Inject(PASSWORD_OPTIONS)
    private readonly option: PasswordOption,

    private readonly userService: UserService,
    private readonly emailCertificationService: EmailCertificationService,
    private readonly prisma: PrismaService,
  ) {}

  async hash(password: string) {
    const hashedPassword = bcrypt.hash(password, this.option.salt);
    return hashedPassword;
  }
  async compare(password: string, hashed: string) {
    const isMatch = await bcrypt.compare(password, hashed);
    if (!isMatch) return left(AuthError.Authentication.INVALID_PASSWORD);
    return right(true);
  }

  async changePassword(dto: Auth.ChangePasswordDto) {
    switch (dto.type) {
      case 'FIND_PASSWORD':
        return await this.changePasswordViaEmailVerification(dto);
      case 'PROFILE':
        return await this.changePasswordViaCurrentPassword(dto);
      default:
        return left(AuthError.Authentication.INVALID_TYPE);
    }
  }

  private async changePasswordViaEmailVerification(
    dto: Auth.PasswordChangeViaEmailVerificationDto,
  ) {
    const { email_certification_id, email: _email, password, type } = dto;
    const user = await this.checkUser(_email);
    if (isLeft(user)) return user;

    const { email, id } = user.right;
    const result = await this.emailCertificationService.checkEmailCertification(
      { email, id: email_certification_id, type },
    );
    if (isLeft(result))
      return left(AuthError.Authentication.EMAIL_CERTIFICATION_NOT_VERIFIED);
    const hashedPassword = await this.hash(password);

    await this.prisma.$transaction(async (tx) => {
      await this.userService.updatePassword(email, hashedPassword, tx);
      await this.emailCertificationService.expireEmailCertification(
        email_certification_id,
        email,
        type,
        tx,
      );
      await this.userService.createSnapshot(
        {
          email,
          nickname: user.right.nickname,
          password: hashedPassword,
          user_id: user.right.id,
        },
        tx,
      );
    });
    return right({ email, id });
  }

  private async changePasswordViaCurrentPassword(
    dto: Auth.PasswordChangeViaCurrentPasswordDto,
  ) {
    const { email: _email, password, current_password } = dto;
    const user = await this.checkUser(_email);
    if (isLeft(user)) return user;

    const { email, id } = user.right;
    const hashedPassword = await this.hash(password);
    const compare = await this.compare(
      current_password,
      user.right.password || '',
    );
    if (isLeft(compare)) return compare;

    await this.prisma.$transaction(async (tx) => {
      await this.userService.updatePassword(email, hashedPassword, tx);
      await this.userService.createSnapshot(
        {
          email,
          nickname: user.right.nickname,
          password: hashedPassword,
          user_id: user.right.id,
        },
        tx,
      );
    });
    return right({ email, id });
  }

  private async checkUser(email: string) {
    const user = await this.userService.findUnique(email);
    if (isLeft(user)) return left(AuthError.User.USER_NOT_FOUND);
    return right(user.right);
  }
}
