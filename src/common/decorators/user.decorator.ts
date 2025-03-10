import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { UserPayload } from "../types/Payload";

interface CustomRequest extends Request {
  user: UserPayload;
}

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserPayload => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();
    return request.user as UserPayload;
  }
);