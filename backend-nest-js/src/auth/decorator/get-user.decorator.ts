import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as request from 'supertest';

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
