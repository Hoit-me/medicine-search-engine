import { UseInterceptors, applyDecorators } from '@nestjs/common';
import { UserLoggingInterceptor } from '../interceptor/userLogging.interceptor';

export function UserLog() {
  return applyDecorators(UseInterceptors(UserLoggingInterceptor));
}
