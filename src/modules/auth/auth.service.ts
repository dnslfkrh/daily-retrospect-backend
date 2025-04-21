import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UserService } from "../user/user.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  private readonly cognitoDomain: string;
  private readonly awsRegion: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly userService: UserService,
  ) {
    this.cognitoDomain = this.configService.get<string>("AWS_COGNITO_DOMAIN");
    this.awsRegion = this.configService.get<string>("AWS_REGION");

    if (!this.cognitoDomain || !this.awsRegion) {
      throw new Error("Cognito domain or region is missing. Please check your environment variables.");
    }
  }

  async exchangeCodeForToken(code: string) {
    const tokenUrl = `https://${this.cognitoDomain}.auth.${this.awsRegion}.amazoncognito.com/oauth2/token`;

    const clientId = this.configService.get<string>("AWS_COGNITO_CLIENT_ID");
    const clientSecret = this.configService.get<string>("AWS_COGNITO_CLIENT_SECRET");
    const redirectUri = this.configService.get<string>("AWS_COGNITO_CALLBACK_URL");

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
    const userInfoUrl = `https://${this.cognitoDomain}.auth.${this.awsRegion}.amazoncognito.com/oauth2/userInfo`;

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
      const tokenUrl = `https://${this.cognitoDomain}.auth.${this.awsRegion}.amazoncognito.com/oauth2/token`;
      const clientId = this.configService.get<string>("AWS_COGNITO_CLIENT_ID");
      const clientSecret = this.configService.get<string>("AWS_COGNITO_CLIENT_SECRET");

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