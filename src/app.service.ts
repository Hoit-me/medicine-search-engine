import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  async healthCheck(): Promise<string> {
    return 'OK';
  }

  performance() {
    return process.memoryUsage();
  }
}
