import { Injectable } from '@nestjs/common';
import { Log } from '@src/type/log.type';
import { UserLogRepository } from './../repository/userLog.repository';

@Injectable()
export class UserLogService {
  constructor(private readonly userLogRepository: UserLogRepository) {}

  async create(log: Log.User) {
    return await this.userLogRepository.create(log);
  }
}
