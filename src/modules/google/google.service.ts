import { Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { GoogleTokenRepository } from "src/repositories/google-token.repository";
import { google } from "googleapis";
import { GOOGLE_CALLBACK_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from "src/common/config/env/env";
import { GoogleToken } from "src/entities/google-token.entity";
import { User } from "src/entities/user.entity";

@Injectable()
export class GoogleService {
  constructor(
    private readonly googleRepository: GoogleTokenRepository
  ) { }

  async findGoogleTokenByGoogleId(google_id: string): Promise<GoogleToken | undefined> {
    return this.googleRepository.findGoogleTokenByGoogleId(google_id);
  }

  /* OAuth2 클라이언트 생성 */
  private createOAuthClient() {
    return new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL
    );
  }

  /* Google API 요청 시 자동으로 토큰을 갱신하는 메서드 */
  async useGoogleApi(userId: number) {
    let googleToken = await this.googleRepository.findGoogleTokenByUserId(userId);

    if (!googleToken) {
      throw new UnauthorizedException('Google 인증 정보가 없습니다. 다시 로그인해주세요.');
    }

    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({ access_token: googleToken.access_token });

    const tokenInfo = await oauth2Client.getTokenInfo(googleToken.access_token).catch(() => null);
    if (!tokenInfo) {
      const newAccessToken = await this.refreshGoogleAccessToken(userId);
      oauth2Client.setCredentials({ access_token: newAccessToken });
    }

    return oauth2Client;
  }

  /* 구글 토큰 저장 */
  async saveGoogleTokens(user: User, accessToken: string, refreshToken?: string): Promise<GoogleToken> {
    let googleToken = await this.googleRepository.findGoogleTokenByUserId(user.id);

    if (!googleToken) {
      googleToken = new GoogleToken();
      googleToken.user = user;
      googleToken.google_id = user.google_id;
    }

    googleToken.access_token = accessToken;

    if (refreshToken) {
      googleToken.refresh_token = refreshToken;
    }

    return this.googleRepository.saveGoogleToken(googleToken);
  }

  /* 액세스 토큰 리프레시 */
  async refreshGoogleAccessToken(userId: number): Promise<string> {
    const googleToken = await this.googleRepository.findGoogleTokenByUserId(userId);
    if (!googleToken || !googleToken.refresh_token) {
      throw new UnauthorizedException('Refresh token이 없습니다. 다시 로그인해주세요.');
    }

    const oauth2Client = this.createOAuthClient();
    oauth2Client.setCredentials({ refresh_token: googleToken.refresh_token });

    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      googleToken.access_token = credentials.access_token;
      await this.googleRepository.saveGoogleToken(googleToken);
      return credentials.access_token;
    } catch (error: any) {
      if (error.response?.data?.error === 'invalid_grant') {
        throw new UnauthorizedException('Refresh token이 만료되었습니다. 다시 로그인해주세요.');
      }
      throw new InternalServerErrorException('Google Access Token 갱신 실패');
    }
  }
}