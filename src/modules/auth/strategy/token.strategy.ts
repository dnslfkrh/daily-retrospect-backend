import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as jwksClient from "jwks-rsa";
import { promisify } from "util";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";
import { AWS_COGNITO_USER_POOL_ID, AWS_REGION } from "src/common/config/env/env";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private jwksClient;

  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: async (request, rawJwtToken, done) => {
        try {
          const decoded: any = jwt.decode(rawJwtToken, { complete: true });

          if (!decoded || !decoded.header || !decoded.header.kid) {
            return done(new Error("Invalid token"), null);
          }

          const key = await this.getSigningKey(decoded.header.kid);
          done(null, key);
        } catch (error) {
          done(error, null);
        }
      },
    });

    this.jwksClient = jwksClient({
      jwksUri: `https://cognito-idp.${AWS_REGION}.amazonaws.com/${AWS_COGNITO_USER_POOL_ID}/.well-known/jwks.json`,
    });
  }

  private async getSigningKey(kid: string): Promise<string> {
    const getSigningKey = promisify(this.jwksClient.getSigningKey);
    const key = (await getSigningKey(kid)) as jwksClient.SigningKey;
    return key.getPublicKey();
  }

  async validate(payload: any) {
    return { sub: payload.sub, email: payload.email };
  }
}