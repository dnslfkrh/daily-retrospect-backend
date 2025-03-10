import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { ACCESS_TOKEN_EXPIRATION, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_EXPIRATION, REFRESH_TOKEN_SECRET } from "src/common/config/env/env";
import { UserPayload } from "src/common/types/Payload";
import { NewUserProps } from "src/common/types/Props";
import { resCookie } from "src/common/utils copy/resCookie";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService
  ) { }

  createAccessToken(payload: UserPayload) {
    return this.jwtService.sign(payload, {
      secret: ACCESS_TOKEN_SECRET,
      expiresIn: `${ACCESS_TOKEN_EXPIRATION}s`
    });
  }

  private createRefreshToken(payload: UserPayload) {
    return this.jwtService.sign(payload, {
      secret: REFRESH_TOKEN_SECRET,
      expiresIn: `${REFRESH_TOKEN_EXPIRATION}s`
    });
  }

  setJwtTokens(user: UserPayload, res: Response) {
    const payload = {
      id: user.id,
      google_id: user.google_id,
      email: user.email,
      name: user.name,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    resCookie(res, 'refreshToken', refreshToken);

    return { accessToken };
  }
}