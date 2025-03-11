import { Controller, Get, Query, Res, UnauthorizedException } from "@nestjs/common";
import { Response } from "express";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  @Get("cognito/callback")
  async cognitoCallback(@Query("code") code: string, @Res() res: Response) {
    try {
      // 1. Cognito 로그인 후 받은 code로 Token들 가져오기
      const tokenData = await this.authService.exchangeCodeForToken(code);

      // 2. refresh token을 쿠키에 저장 (나중에 쿠키로 보내야 하는거 생기면 utils로 이동)
      res.cookie("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });

      // 3. access token으로 사용자 정보 가져오기
      const userInfo = await this.authService.getUserInfo(tokenData.access_token);
      console.log("userInfo:", userInfo);

      // 4. 사용자 정보 DB에 저장
      await this.userService.joinOrAlready(userInfo);

      // 5. 로그인 완료 후 클라이언트 콜백 리다이렉트
      const frontendUrl = `http://localhost:3000/auth/callback?accessToken=${tokenData.access_token}&idToken=${tokenData.id_token}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      console.error("Cognito callback error:", error);
      throw new UnauthorizedException("Failed to process Cognito Login");
    }
  }
}