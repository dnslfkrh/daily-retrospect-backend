import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { REFRESH_TOKEN_SECRET } from "src/common/config/env/env";
import { UserPayload } from "src/common/types/Payload";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refreshToken") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies['refreshToken'],
      ]),
      secretOrKey: REFRESH_TOKEN_SECRET,
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: UserPayload) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new Error('Refresh token not found');
    }
    return {
      ...payload,
      refreshToken
    };
  }
}