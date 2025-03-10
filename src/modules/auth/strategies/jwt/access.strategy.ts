import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { google } from "googleapis";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ACCESS_TOKEN_SECRET } from "src/common/config/env/env";
import { UserPayload } from "src/common/types/Payload";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "accessToken") {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: ACCESS_TOKEN_SECRET,
    });
  }

  async validate(payload: UserPayload) {
    return {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      google_id: payload.google_id,
    };
  }
}
