import { Deserializer, Serializer } from '@nestjs/microservices';
import { RedisStreamContext2 } from './stream.context';
// export async function serialize(
//   payload: any,
//   inboundContext: RedisStreamContext,
// ): Promise<string[] | null> {
//   if (!!!payload.data)
//     throw new Error("Could not find the 'data' key in the payload.");
//   try {
//     const contextHeaders = inboundContext.getMessageHeaders();

//     const responseObj = {
//       ...contextHeaders,
//       ...payload,
//     };

//     responseObj.data = JSON.stringify(payload?.data);

//     const stringifiedResponse = stringifyMessage(responseObj);
//     // console.log('stringifiedResponse', stringifiedResponse);
//     return stringifiedResponse;
//   } catch (error) {
//     logger.error(error);
//     return null;
//   }
// }

export interface RedisStreamRequest<T = any> {
  value: T;
  headers: Record<string, any>;
}

export class RedisStreamRequestSerializer implements Serializer<any, string[]> {
  serialize(value: any, ctx: RedisStreamContext2) {
    // console.log('RedisStreamRequestSerializer value', value);
    if (!value.value)
      throw new Error("Could not find the 'data' key in the payload.");
    const headers = ctx.getMessageHeaders();
    const payload = {
      headers,
      value: value.value,
    };
    return this.stringify(payload);
  }
  encode(value: any): string {
    return JSON.stringify(value);
  }
  stringify(value: Record<string, any>): string[] {
    return Object.entries(value)
      .map(([key, value]) => [key, this.encode(value)])
      .flat();
  }
}

/**
 * @publicApi
 */
export class RedisStreamResponseDeserializer implements Deserializer<any, any> {
  deserialize(message: any, ctx: RedisStreamContext2) {
    // console.log('message', message);
    const parsed = this.parseRawMessage(message);
    const headers = this.decode(parsed.headers);
    ctx.setMessageHeaders(headers);
    const decoded = this.decode(parsed.value);
    return decoded;
  }

  decode(value: string): any {
    return JSON.parse(value);
  }

  parseRawMessage(rawMessage: any): any {
    const [, payload] = rawMessage;

    const obj = (payload as any[]).reduce((acc, cur, idx, arr) => {
      if (idx % 2 === 0) {
        acc[cur] = arr[idx + 1];
      }
      return acc;
    }, {});

    return obj;
  }
}

// export async function deserialize(
//   rawMessage: any,
//   inboundContext: RedisStreamContext,
// ) {
//   // console.log(rawMessage);
//   const parsedMessageObj = parseRawMessage(rawMessage);

//   // console.log('parsedMessageObj', parsedMessageObj);
//   if (!!!parsedMessageObj?.data)
//     throw new Error("Could not find the 'data' key in the message.");

//   const headers = { ...parsedMessageObj };
//   delete headers.data;
//   inboundContext.setMessageHeaders(headers);

//   const data = await parseJson(parsedMessageObj.data);

//   return data;
// }
