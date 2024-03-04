import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { AuthError } from '@src/constant/error/auth.error';
import { Observable } from 'rxjs';
import typia from 'typia';
import { BasicAuthJWTService, JwtPayload } from '../auth.interface';
import { JWT_SERVICE } from '../constant';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly jwtService: BasicAuthJWTService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    return this.validateRequest(request);
  }

  private validateRequest(request: any) {
    const token = request.headers?.authorization?.split(' ')[1];
    if (!token)
      throw new HttpException(
        AuthError.Authentication.TOKEN_MISSING,
        AuthError.Authentication.TOKEN_MISSING.status,
      );

    const user = this.jwtService.accessTokenVerify(token);
    if (!user || !typia.is<JwtPayload>(user))
      throw new HttpException(
        AuthError.Authentication.TOKEN_INVALID,
        AuthError.Authentication.TOKEN_INVALID.status,
      );
    request.user = user;
    return true;
  }
}
