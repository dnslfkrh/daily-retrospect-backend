import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { CustomRequest } from "../types/custom-request.type";
import { UserSub } from "../types/user-payload.type";

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserSub => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user as UserSub;
  }
);