import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const GetAccount = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const { account } = req.user;

    if (!account)
      throw new InternalServerErrorException('Account not found (request)');

    return !data ? account : account[data];
  },
);
