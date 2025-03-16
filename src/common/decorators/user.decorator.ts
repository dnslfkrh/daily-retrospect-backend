import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CustomRequest } from "../types/CustomRequest";
import { UserSub } from "../types/Payload";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSub => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user as UserSub;
  }
);