import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { UserSub } from "src/common/types/user-payload.type";
import { ChangePasswordDto } from "./dto/password.dto";
import { AdminGetUserCommand, ChangePasswordCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthService {
  private cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_KEY
    }
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly userService: UserService,

  ) { }

  async exchangeCodeForToken(code: string) {
    const tokenUrl = `https://${process.env.AWS_COGNITO_DOMAIN}.auth.${process.env.AWS_REGION}.amazoncognito.com/oauth2/token`;

    const clientId = process.env.AWS_COGNITO_CLIENT_ID
    const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET
    const redirectUri = process.env.AWS_COGNITO_CALLBACK_URL

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", redirectUri);
    data.append("client_id", clientId);
    data.append("scope", "openid profile email aws.cognito.signin.user.admin");

    try {
      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
        })
      );

      return response.data;
    } catch (error) {
      console.error("Token exchange failed", error.response?.data || error.message);
      throw new UnauthorizedException("Invalid authorization code");
    }
  }

  async getUserInfo(accessToken: string) {
    const userInfoUrl = `https://${process.env.AWS_COGNITO_DOMAIN}.auth.${process.env.AWS_REGION}.amazoncognito.com/oauth2/userInfo`;

    try {
      const response = await firstValueFrom(
        this.httpService.get(userInfoUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
      );

      return response.data;
    } catch (error) {
      console.error("Failed to fetch user info", error.response?.data || error.message);
      throw new UnauthorizedException("Failed to fetch user info");
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenUrl = `https://${process.env.AWS_COGNITO_DOMAIN}.auth.${process.env.AWS_REGION}.amazoncognito.com/oauth2/token`;
      const clientId = process.env.AWS_COGNITO_CLIENT_ID;
      const clientSecret = process.env.AWS_COGNITO_CLIENT_SECRET;

      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const data = new URLSearchParams();
      data.append("grant_type", "refresh_token");
      data.append("refresh_token", refreshToken);
      data.append("client_id", clientId);
      data.append("scope", "openid profile email aws.cognito.signin.user.admin");

      const response = await firstValueFrom(
        this.httpService.post(tokenUrl, data, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${authHeader}`,
          },
        })
      );

      return response.data;
    } catch (error) {
      console.error("Cognito refresh token error:", error.response?.data || error.message);
      throw new UnauthorizedException("Failed to refresh access token");
    }
  }
}