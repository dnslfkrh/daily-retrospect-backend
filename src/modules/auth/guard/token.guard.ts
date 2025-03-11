import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { Observable, lastValueFrom } from "rxjs";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());
    if (isPublic) {
      return true;
    }

    const result = super.canActivate(context);
    if (result instanceof Promise) {
      return await result;
    } else if (result instanceof Observable) {
      return await lastValueFrom(result);
    }
    return result;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException("Unauthorized access");
    }
    return user;
  }
}
