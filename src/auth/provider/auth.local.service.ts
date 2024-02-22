import { Inject, Injectable } from '@nestjs/common';
import { EmailCertificationService } from '@src/services/emailCertification.service';
import { UserService } from '@src/services/user.service';
import { Auth } from '@src/type/auth';
import { isLeft, right } from 'fp-ts/lib/Either';
import {
  BasicAuthJWTService,
  BasicAuthPasswordService,
  BasicAuthService,
} from '../auth.interface';
import { JWT_SERVICE, PASSWORD_SERVICE } from '../constant';

@Injectable()
export class AuthLocalService implements BasicAuthService {
  constructor(
    private readonly userService: UserService,
    private readonly emailCertificationService: EmailCertificationService,
    @Inject(PASSWORD_SERVICE)
    private readonly passwordService: BasicAuthPasswordService,
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}
  async signup(dto: Auth.SignupDto) {
    if (dto.type !== 'local') throw new Error('Check Signup type!'); // never
    const { email, password, nickname, email_certification_id } = dto;

    const user = await this.userService.checkEmailExists(email);
    if (isLeft(user)) return user;
    const nicknameExists = await this.userService.checkNicknameExists(nickname);
    if (isLeft(nicknameExists)) return nicknameExists;
    const checkEmailCertification =
      await this.emailCertificationService.checkEmailCertification({
        email,
        id: email_certification_id,
      });
    if (isLeft(checkEmailCertification)) return checkEmailCertification;

    const hashedPassword = await this.passwordService.hash(password);
    const newUser = await this.userService.createUser({
      email,
      password: hashedPassword,
      nickname,
    });

    return right(newUser);
  }
  async login(dto: Auth.LoginDto) {
    if (dto.type !== 'local') throw new Error('Check Login type!'); // never
    const { email, password } = dto;
    const eitherUser = await this.userService.findUnique(email);
    if (isLeft(eitherUser)) return eitherUser;
    const { right: user } = eitherUser;
    const isPasswordMatch = await this.passwordService.compare(
      password,
      user.password,
    );
    if (isLeft(isPasswordMatch)) return isPasswordMatch;
    const payload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.accessTokenSign(payload);
    const refreshToken = this.jwtService.refreshTokenSign(payload);
    return right({
      access_token: accessToken,
      refresh_token: refreshToken,
      payload,
    });
  }
}
