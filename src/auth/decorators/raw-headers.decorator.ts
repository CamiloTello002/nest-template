import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const RawHeaders = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    // this is key. The param decorator has access to the request context
    // If you try to do the same with a decorator different from createParamDecorator,
    // you can't do that because it won't have access to the context by default.
    // You can custom provide the context, but it's unnecessary workload and you
    // already have a function that does it for you
    const req = ctx.switchToHttp().getRequest();
    const rawHeaders = req.rawHeaders;

    if (!rawHeaders) throw new InternalServerErrorException('Raw headers not found');

    return rawHeaders;
  }
)
