import {
  ConsumerDeserializer,
  ConsumerSerializer,
  ProducerDeserializer,
  ProducerSerializer,
} from '@nestjs/microservices';
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
    headers: Record<string, any>;
    value: any;
  };
  pattern: string;
}

export type StreamResponse =
  | StreamResponseObject[]
  | StreamResponseObject
  | boolean
  | undefined
  | null;

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

export interface ProducerSerialization {
  serializer?: ProducerSerializer;
  deserializer?: ProducerDeserializer;
}

export interface ConsumerSerialization {
  deserializer?: ConsumerDeserializer;
  serializer?: ConsumerSerializer;
}

export interface ClientConstructorOptions {
  streams: RedisStreamOptions;
  connection?: RedisConnectionOptions;
  serialization?: ProducerSerialization;
  responesePattern?: string[];
}
export interface ServerConstructorOptions {
  streams: RedisStreamOptions;
  connection?: RedisConnectionOptions;
  serialization?: ConsumerSerialization;
}

export interface ConstructorOptions {
  streams: RedisStreamOptions;
  connection?: RedisConnectionOptions;
  serialization?: Serialization;
}

export type PayloadWrapper<T> = T & { correlationId: string };
