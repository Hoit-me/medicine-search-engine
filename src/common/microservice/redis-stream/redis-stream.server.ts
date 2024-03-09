import { Logger } from '@nestjs/common';
import { CustomTransportStrategy, Server } from '@nestjs/microservices';
import { CONNECT_EVENT, ERROR_EVENT } from '@nestjs/microservices/constants';
import { Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import {
  ConstructorOptions,
  RedisInstance,
  RedisStreamPattern,
  StreamResponse,
  StreamResponseObject,
} from './interface';
import { createRedisConnection } from './redis';
import { RedisStreamContext } from './stream.context';
export class RedisStreamServer
  extends Server
  implements CustomTransportStrategy
{
  logger = new Logger('RedisStreamServer');
  private streamHandlerMap: Record<string, any> = {};
  private redis?: RedisInstance;
  private client?: RedisInstance;
  constructor(private readonly options: ConstructorOptions) {
    super();
  }

  listen(callback: () => void) {
    this.redis = createRedisConnection(this.options?.connection);
    this.client = createRedisConnection(this.options?.connection);
    this.handleConnectionError(this.redis);
    this.handleConnectionError(this.client);

    this.redis.on(CONNECT_EVENT, () => {
      this.logger.log('Connected to Redis', this.options.connection?.path);
    });

    this.bindHandlers();

    callback();
  }

  close() {
    this.redis && this.redis.disconnect();
    this.client && this.client.disconnect();
  }

  handleConnectionError(client: RedisInstance) {
    client.on(ERROR_EVENT, (err) => {
      this.logger.error('Reids Error', err);
      this.close();
    });
  }

  async bindHandlers() {
    try {
      await Promise.all(
        [...this.messageHandlers.keys()].map(async (pattern: string) => {
          await this.registerStream(pattern);
        }),
      );
      this.listenOnStreams();
    } catch (e) {
      this.logger.error('bindHandlers', e);
      throw e;
    }
  }

  private async registerStream(pattern: string) {
    try {
      // console.log('pattern', pattern);
      const parsedPattern: RedisStreamPattern = JSON.parse(pattern);
      if (!parsedPattern.isRedisStreamHandler) {
        return false;
      }
      const { stream } = parsedPattern;
      this.streamHandlerMap[stream] = this.messageHandlers.get(pattern);

      await this.createConsumerGroup(
        stream,
        this.options?.streams?.consumerGroup,
      );
    } catch (e) {
      this.logger.error('registerStream', e);
      return false;
    }
  }

  private async createConsumerGroup(stream: string, consumerGroup: string) {
    try {
      if (!this.redis) {
        return false;
      }
      await this.redis.xgroup('CREATE', stream, consumerGroup, '$', 'MKSTREAM');
      return true;
    } catch (e) {
      this.logger.verbose('createConsumerGroup', e);
      return false;
    }
  }

  private async handleAck(inboundContext: RedisStreamContext) {
    try {
      if (!this.client) {
        return false;
      }
      await this.client.xack(
        inboundContext.getStream(),
        inboundContext.getConsumerGroup(),
        inboundContext.getMessageId(),
      );

      if (true === this.options?.streams?.deleteMessagesAfterAck) {
        await this.client.xdel(
          inboundContext.getStream(),
          inboundContext.getMessageId(),
        );
      }
      return true;
    } catch (e) {
      this.logger.error('handleAck', e);
      return false;
    }
  }

  private async handleRespondBack({
    response,
    inboundContext,
  }: {
    response: any;
    inboundContext: RedisStreamContext;
    isDisposed: boolean;
  }) {
    console.log('handleRespondBack', response, inboundContext);
    try {
      if (!this.client) {
        return;
      }
      if (!response) {
        return;
      }

      if (Array.isArray(response) && response.length === 0) {
        await this.handleAck(inboundContext);
        return;
      }

      if (Array.isArray(response) && response.length > 0) {
        const publishedResponse = await this.publishResponses(
          response,
          inboundContext,
        );

        if (!publishedResponse) {
          return new Error('Failed to publish response');
        }
      }
      await this.handleAck(inboundContext);
    } catch (e) {
      this.logger.error('handleRespondBack', e);
      return false;
    }
  }

  async publishResponses(
    response: StreamResponse,
    inboundContext: RedisStreamContext,
  ) {
    try {
      if (!this.client) {
        return;
      }
      if (!response) {
        return;
      }
      if (!Array.isArray(response)) {
        return;
      }

      await Promise.all(
        response.map(async (resObj: StreamResponseObject) => {
          if (!this.client) return;
          console.log('resObj', resObj);
          let serializedEntries: string[] = [];
          if (typeof this.options.serialization?.serializer === 'function') {
            serializedEntries = await this.options.serialization?.serializer(
              resObj.payload,
              inboundContext,
            );
          } else {
            serializedEntries =
              (await serialize(resObj.payload, inboundContext)) || [];
          }
          console.log(serializedEntries);
          await this.client.xadd(resObj.pattern, '*', ...serializedEntries);
        }),
      );
    } catch (e) {
      this.logger.error('publishResponses', e);
      return false;
    }
  }

  private async notifyHandlers(stream: string, message: any[]) {
    try {
      console.log('notifyHandlers', stream, message);

      const handler = this.streamHandlerMap[stream];
      // console.log('message', message);
      // console.log(stream);

      await Promise.all(
        message.map(async (m) => {
          // console.log('m', m);
          // console.log(
          //   this.options?.streams?.consumerGroup,
          //   this.options?.streams?.consumer,
          // );
          const ctx = new RedisStreamContext([
            stream,
            m[0],
            this.options?.streams?.consumerGroup,
            this.options?.streams?.consumer,
          ]);

          let parsedPayload: any;
          if (typeof this.options.serialization?.deserializer === 'function') {
            parsedPayload = await this.options.serialization?.deserializer(
              m,
              ctx,
            );
          } else {
            parsedPayload = await deserialize(m, ctx);
          }
          console.log(
            stream,
            m[0],
            this.options?.streams?.consumerGroup,
            this.options?.streams?.consumer,
            ctx,
            parsedPayload,
          );
          // console.log('notifyHandlersparsedPayload', parsedPayload);
          const stageRespondBack = async (responseObj: any) => {
            responseObj.inboundContext = ctx;
            console.log('responseObj', responseObj);
            this.handleRespondBack(responseObj);
          };

          const response$ = this.transformToObservable(
            await handler(parsedPayload, ctx),
          ) as Observable<any>;

          response$ && this.send(response$, stageRespondBack);
        }),
      );
    } catch (e) {
      this.logger.error('notifyHandlers error', e);
    }
  }

  private async listenOnStreams() {
    try {
      let results: any[] = [];
      if (!this.redis) return;
      if (
        !this.options?.streams?.consumerGroup ||
        !this.options?.streams?.consumer
      )
        throw new Error(
          'Consumer Group and Consumer are required for xreadgroup',
        );

      results = await this.redis.xreadgroup(
        'GROUP',
        this.options?.streams?.consumerGroup,
        this.options?.streams?.consumer,
        'BLOCK',
        this.options?.streams?.block || 0,
        'STREAMS',
        ...(Object.keys(this.streamHandlerMap) as string[]), // streams keys
        ...(Object.keys(this.streamHandlerMap) as string[]).map(() => '>'), // '>', this is needed for xreadgroup as id.
      );

      // if BLOCK time ended, and results are null, listen again.
      if (!results) return this.listenOnStreams();

      for (const result of results) {
        const [stream, messages] = result;
        await this.notifyHandlers(stream, messages);
      }

      return this.listenOnStreams();
    } catch (e) {
      this.logger.error('listenOnStreams', e);
    }
  }
}

const logger = new Logger('RedisStreams/streams-utils');

export async function deserialize(
  rawMessage: any,
  inboundContext: RedisStreamContext,
) {
  const parsedMessageObj = parseRawMessage(rawMessage);
  // console.log(rawMessage);
  // console.log('parsedMessageObj', parsedMessageObj);
  if (!!!parsedMessageObj?.value)
    throw new Error("Could not find the 'data' key in the message.");

  const headers = { ...parsedMessageObj };
  delete headers.value;
  inboundContext.setMessageHeaders(await parseJson(parsedMessageObj.headers));

  const data = await parseJson(parsedMessageObj.value);

  return data;
}

export async function serialize(
  payload: any,
  inboundContext: RedisStreamContext,
): Promise<string[] | null> {
  try {
    const contextHeaders = inboundContext.getMessageHeaders();
    const responseObj = {
      ...contextHeaders,
    };

    responseObj.data = JSON.stringify(payload);
    const stringifiedResponse = stringifyMessage(responseObj);
    // console.log('stringifiedResponse', stringifiedResponse);
    return stringifiedResponse;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function parseJson(data: string): Promise<any> {
  try {
    // console.log('parseJson data', data);
    const parsed = JSON.parse(data);
    return parsed;
  } catch (error) {
    logger.verbose(error);
    return data;
  }
}

export function parseRawMessage(rawMessage: any): any {
  // console.log('ParseRawMessage', rawMessage);
  const payload = rawMessage[1];

  const obj = {};

  for (let i = 0; i < payload.length; i += 2) {
    obj[payload[i]] = payload[i + 1];
  }

  return obj;
}

export function stringifyMessage(messageObj: any[]): any {
  try {
    // console.log('stringifyMessage', messageObj);

    const finalArray: any[] = [];

    for (const key in messageObj) {
      finalArray.push(key);
      finalArray.push(messageObj[key]);
    }

    return finalArray;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export function generateCorrelationId() {
  return uuidv4();
}
