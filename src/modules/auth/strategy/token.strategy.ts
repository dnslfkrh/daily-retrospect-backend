import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import * as jwksClient from "jwks-rsa";
import { promisify } from "util";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  private jwksClient;
  private readonly awsRegion: string;
  private readonly cognitoUserPoolId: string;

  constructor(
    private readonly configService: ConfigService
  ) {
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

    this.awsRegion = this.configService.get<string>("AWS_REGION");
    this.cognitoUserPoolId = this.configService.get<string>("AWS_COGNITO_USER_POOL_ID");


    if (!this.awsRegion || !this.cognitoUserPoolId) {
      throw new Error("AWS_REGION or COGNITO_USER_POOL_ID is not defined in environment variables.");
    }

    this.jwksClient = jwksClient({
      jwksUri: `https://cognito-idp.${this.awsRegion}.amazonaws.com/${this.cognitoUserPoolId}/.well-known/jwks.json`,
    });
  }

  private async getSigningKey(kid: string): Promise<string> {
    const getSigningKey = promisify(this.jwksClient.getSigningKey);
    const key = (await getSigningKey(kid)) as jwksClient.SigningKey;
    return key.getPublicKey();
  }

  async validate(payload: any) {
    return { sub: payload.sub };
  }
}