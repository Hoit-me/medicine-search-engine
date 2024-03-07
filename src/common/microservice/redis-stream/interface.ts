import * as Redis from 'ioredis';
import { RedisStreamContext } from './stream.context';

export type RedisInstance = Redis.Redis;
export interface RedisStreamPattern {
  isRedisStreamHandler: boolean;
  stream: string;
}
interface RedisStreamOptionsXreadGroup {
  block?: number;
  consumerGroup: string;
  consumer: string;
  deleteMessagesAfterAck?: boolean;
}

export type RedisStreamOptions = RedisStreamOptionsXreadGroup;
export type RedisConnectionOptions = { optinons?: Redis.RedisOptions } & {
  path: string;
};
export type RawStreamMessage = [id: string, payload: string[]];

export interface StreamResponseObject {
  payload: {
    [key: string]: any; // any extra keys goes as headers.
    data: any;
  };
  stream: string;
}

export type StreamResponse = StreamResponseObject[] | null | undefined;

export interface Serialization {
  deserializer?: (
    rawMessage: RawStreamMessage,
    inboundContext: RedisStreamContext,
  ) => any | Promise<any>;

  serializer?: (
    parsedPayload: any,
    inboundContext: RedisStreamContext,
  ) => string[] | Promise<string[]>;
}

export interface ConstructorOptions {
  streams: RedisStreamOptions;
  connection?: RedisConnectionOptions;
  serialization?: Serialization;
}
