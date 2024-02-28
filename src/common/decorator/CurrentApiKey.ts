import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const CurrentApiKey = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    if (req.api_key) return req.api_key;
    return null;
  },
);
