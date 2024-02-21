import { Module } from '@nestjs/common';
import { UserRepository } from '@src/repository/user.repository';
import { UserService } from '@src/services/user.service';

@Module({
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
