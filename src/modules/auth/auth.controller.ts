import { Body, Controller, Get, Post, Query, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { Public } from "src/common/decorators/public.decorator";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { ChangePasswordDto } from "./dto/password.dto";
import { FRONTEND_URL } from "src/common/config/env/env";

const logoutUrl = `${FRONTEND_URL}/auth`;

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

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

      const frontendUrl = `${FRONTEND_URL}/auth/callback?accessToken=${tokenData.access_token}&idToken=${tokenData.id_token}`;
      return res.redirect(frontendUrl);
    } catch (error) {
      console.error("Cognito callback error:", error);
      throw new UnauthorizedException("Failed to process Cognito Login");
    }
  }

  @Public()
  @Post("refresh")
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    try {
      const refreshToken = req.cookies.refresh_token;
      if (!refreshToken) {
        return res.redirect(logoutUrl);
      }

      const tokenData = await this.authService.refreshAccessToken(refreshToken);

      return res.json({ access_token: tokenData.access_token, id_token: tokenData.id_token });
    } catch (error) {
      console.error("Failed to refresh access token:", error);
      throw new UnauthorizedException("Failed to refresh token");
    }
  }

  @Public()
  @Get("cognito/logout")
  async logout(@Res() res: Response) {
    try {
      res.clearCookie("refresh_token", { httpOnly: true, secure: true, sameSite: 'lax' });
      return res.redirect(logoutUrl);
    } catch (error) {
      console.error("Logout error:", error);
      throw new UnauthorizedException("Failed to log out");
    }
  }

  @Get("user-info")
  async getUserInfo(@User() user: UserSub) {
    return await this.authService.getCognitoUser(user);
  }

  @Post("change-password")
  async changePassword(
    @User() user: UserSub,
    @Body() body: ChangePasswordDto,
    @Req() req: Request
  ) {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (!accessToken) {
      throw new UnauthorizedException("Access token is required");
    }

    await this.authService.changePassword(user, body, accessToken);
    return { message: "Password changed successfully" };
  }
}
