import { Injectable, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { AWS_COGNITO_CALLBACK_URL, AWS_COGNITO_CLIENT_ID, AWS_COGNITO_CLIENT_SECRET, AWS_COGNITO_DOMAIN, AWS_COGNITO_USER_POOL_ID, AWS_REGION, AWS_SES_ACCESS_KEY, AWS_SES_SECRET_KEY } from "src/common/config/env/env";
import { UserSub } from "src/common/types/Payload";
import { ChangePasswordDto } from "./dto/password.dto";
import { AdminGetUserCommand, ChangePasswordCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

@Injectable()
export class AuthService {
  private cognitoClient = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_SES_ACCESS_KEY,
      secretAccessKey: AWS_SES_SECRET_KEY
    }
  });

  constructor(
    private readonly httpService: HttpService,
    private readonly userRepository: UserRepository,
  ) { }

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
    data.append("scope", "openid profile email aws.cognito.signin.user.admin");

    console.log("Requesting scopes:", data.get("scope"));

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

  async refreshAccessToken(refreshToken: string) {
    try {
      const tokenUrl = `https://${AWS_COGNITO_DOMAIN}.auth.${AWS_REGION}.amazoncognito.com/oauth2/token`;
      const clientId = AWS_COGNITO_CLIENT_ID;
      const clientSecret = AWS_COGNITO_CLIENT_SECRET;

      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

      const data = new URLSearchParams();
      data.append("grant_type", "refresh_token");
      data.append("refresh_token", refreshToken);
      data.append("client_id", clientId);
      data.append("scope", "openid profile email aws.cognito.signin.user.admin");

      console.log("Requesting scopes refresh:", data.get("scope"));

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

  async getCognitoUser(user: UserSub) {
    try {
      const username = typeof user === "string" ? user : user.sub;

      const command = new AdminGetUserCommand({
        UserPoolId: AWS_COGNITO_USER_POOL_ID,
        Username: username,
      });

      const result = await this.cognitoClient.send(command);

      const attributes = result.UserAttributes?.reduce((acc, attr) => {
        acc[attr.Name] = attr.Value;
        return acc;
      }, {} as Record<string, string>);

      return {
        username: result.Username,
        attributes,
        isSocialUser: Boolean(attributes["identities"]),
      };
    } catch (error) {
      console.error("Failed to get user info from Cognito:", error);
      throw new UnauthorizedException("Failed to retrieve user information");
    }
  }

  async changePassword(user: UserSub, body: ChangePasswordDto, accessToken: string): Promise<void> {
    const { previousPassword, newPassword } = body;

    try {
      const userInfo = await this.getCognitoUser(user);
      if (userInfo.isSocialUser) {
        throw new UnauthorizedException("소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.");
      }

      const command = new ChangePasswordCommand({
        PreviousPassword: previousPassword,
        ProposedPassword: newPassword,
        AccessToken: accessToken,
      });

      await this.cognitoClient.send(command);
    } catch (error) {
      if (error.name === "InvalidPasswordException") {
        throw new UnauthorizedException(error.message || "Invalid password format");
      } else if (error.name === "NotAuthorizedException") {
        throw new UnauthorizedException("기존 비밀번호가 올바르지 않습니다.");
      } else {
        console.error("Failed to change password:", error);
        throw new UnauthorizedException("Failed to change password");
      }
    }
  }
}