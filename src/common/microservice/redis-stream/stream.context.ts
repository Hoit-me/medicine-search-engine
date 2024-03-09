import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';

declare type RedisStreamContextArgs = [string, string, string, string];

export class RedisStreamContext extends BaseRpcContext<RedisStreamContextArgs> {
  private headers: any;

  /**
   * @param {[string, string, string, string]} args - [stream, message_id, group, consumer]
   * @returns {RedisStreamContext} Stream Context
   */
  constructor(args: RedisStreamContextArgs) {
    super(args);
  }

  getStream(): string {
    return this.args[0];
  }

  getMessageId(): string {
    return this.args[1];
  }

  getMessageHeaders(): any {
    return this.headers;
  }

  setMessageHeaders(headers: any) {
    this.headers = headers;
    return this.headers;
  }

  getConsumerGroup(): string {
    return this.args[2];
  }

  getConsumer(): string {
    return this.args[3];
  }
}

type RedisStreamContextArgs2 = [
  string | undefined, // stream
  string | undefined, // message_id
  string | undefined, // group
  string | undefined, // consumer
];
export class RedisStreamContext2 extends BaseRpcContext<RedisStreamContextArgs2> {
  private headers: Record<string, any> = {};

  /**
   *[stream, message_id, group, consumer]
   */
  constructor(
    args: RedisStreamContextArgs2 = [
      undefined,
      undefined,
      undefined,
      undefined,
    ],
  ) {
    super(args);
  }

  getStream() {
    return this.args[0];
  }
  setStream(stream: string) {
    this.args[0] = stream;
    return this;
  }

  getMessageId() {
    return this.args[1];
  }
  setMessageId(messageId: string) {
    this.args[1] = messageId;
    return this;
  }

  getConsumerGroup() {
    return this.args[2];
  }
  setConsumerGroup(group: string) {
    this.args[2] = group;
    return this;
  }

  getConsumer() {
    return this.args[3];
  }
  setConsumer(consumer: string) {
    this.args[3] = consumer;
    return this;
  }

  getMessageHeaders() {
    return this.headers;
  }

  setMessageHeaders(headers: any) {
    this.headers = headers;
    return this;
  }

  addMessageHeader(key: string, value: any) {
    this.headers[key] = value;
    return this;
  }

  get(): RedisStreamContextArgs2 {
    return this.args;
  }
}
