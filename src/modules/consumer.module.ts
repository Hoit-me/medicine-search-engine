import { Module } from '@nestjs/common';
import { UserLogConsumer } from '@src/comsumer/userLog.consumer';
import { UserLogRepository } from '@src/repository/userLog.repository';
import { UserLogService } from '@src/services/userLog.service';

@Module({
  providers: [UserLogService, UserLogRepository],
  controllers: [UserLogConsumer],
})
export class ConsumerModule {}
