import { Controller, Get, Post, Query, Req, Res, UnauthorizedException } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { Public } from "src/common/decorators/public.decorator";
import { ConfigService } from "@nestjs/config";
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('인증')
@Controller("auth")
export class AuthController {
  private readonly frontend: string;
  private readonly logoutUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.frontend = this.configService.get<string>("FRONTEND_URL");
    this.logoutUrl = this.frontend + "/auth";

    if (!this.frontend) {
      throw new Error("FRONTEND_URL is missing. Please check your environment variables.");
    }
  }

  @ApiOperation({ summary: 'Cognito 로그인 콜백 처리' })
  @ApiQuery({ name: 'code', description: 'Cognito 인증 코드', required: true })
  @ApiResponse({ status: 200, description: '인증 성공 및 프론트엔드로 리다이렉트' })
  @ApiResponse({ status: 401, description: 'Cognito 로그인 처리 실패' })
  @Public()
  @Get("cognito/callback")
  async cognitoCallback(@Query("code") code: string, @Res() res: Response) {
    try {
      const tokenData = await this.authService.exchangeCodeForToken(code);

      res.cookie("refresh_token", tokenData.refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
      });

      const userInfo = await this.authService.getUserInfo(tokenData.access_token);

      await this.userService.joinOrAlready(userInfo);

      const frontendUrl = `${this.frontend}/auth/callback?accessToken=${tokenData.access_token}&idToken=${tokenData.id_token}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      console.error("Cognito callback error:", error);
      throw new UnauthorizedException("Failed to process Cognito Login");
    }
  }

  @ApiOperation({ summary: '액세스 토큰 갱신' })
  @ApiResponse({ status: 200, description: '새로운 액세스 토큰 발급 성공' })
  @ApiResponse({ status: 401, description: '토큰 갱신 실패' })
  @Public()
  @Post("refresh")
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        return res.redirect(`${this.logoutUrl}`);
      }

      const tokenData = await this.authService.refreshAccessToken(refreshToken);

      return res.json({ access_token: tokenData.access_token, id_token: tokenData.id_token });
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw new UnauthorizedException("Failed to refresh token");
    }
  }

  @ApiOperation({ summary: '로그아웃 처리' })
  @ApiResponse({ status: 200, description: '로그아웃 성공 및 프론트엔드로 리다이렉트' })
  @ApiResponse({ status: 401, description: '로그아웃 처리 실패' })
  @Public()
  @Get("cognito/logout")
  async logout(@Res() res: Response) {
    try {
      res.clearCookie("refresh_token", { httpOnly: true, secure: true, sameSite: 'lax' });

      return res.redirect(`${this.logoutUrl}`);
    } catch (error) {
      console.error("Logout error:", error);
      throw new UnauthorizedException("Failed to log out");
    }
  }
}