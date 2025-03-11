import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UserRepository } from "src/repositories/user.repository";
import { AWS_COGNITO_CALLBACK_URL, AWS_COGNITO_CLIENT_ID, AWS_COGNITO_CLIENT_SECRET, AWS_COGNITO_DOMAIN, AWS_REGION } from "src/common/config/env/env";

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
  ) { }

  /* Authorization Code로 Access Token 교환 */
  async exchangeCodeForToken(code: string) {
    const tokenUrl = `https://${AWS_COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com/oauth2/token`;

    const clientId = AWS_COGNITO_CLIENT_ID
    const clientSecret = AWS_COGNITO_CLIENT_SECRET
    const redirectUri = AWS_COGNITO_CALLBACK_URL

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("code", code);
    data.append("redirect_uri", redirectUri);
    data.append("client_id", clientId);

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

  /*  cognito access token에서 사용자 정보 가져오기 */
  async getUserInfo(accessToken: string) {
    const userInfoUrl = `https://${AWS_COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com/oauth2/userInfo`;

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
}