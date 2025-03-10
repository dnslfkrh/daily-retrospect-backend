import { Controller, Get, HttpException, HttpStatus, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Public } from "src/common/decorators/public.decorator";
import { RefreshTokenGuard } from "./guards/refresh.guard";
import { Request, Response } from "express";
import { JwtPayloadWithExp, UserPayload } from "src/common/types/Payload";
import { User } from "src/common/decorators/user.decorator";
import { FRONTEND_URL } from "src/common/config/env/env";
import { AuthGuard } from "@nestjs/passport";
import { NewUserProps } from "src/common/types/Props";

interface AuthenticatedRequest extends Request {
  user: NewUserProps;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Public()
  @Get('refresh')
  @UseGuards(RefreshTokenGuard)
  async refresh(@User() user: UserPayload, @Res() res: Response) {
    console.log("[refresh] user: ", user);
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
    const { exp, iat, refreshToken, ...newPayload } = user as JwtPayloadWithExp;
    const newAccessToken = this.authService.createAccessToken(newPayload);

    return { accessToken: newAccessToken };
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@User() user: UserPayload, @Res() res: Response) {
    console.log(user);
    const { accessToken } = this.authService.setJwtTokens(user, res);
    res.redirect(`${FRONTEND_URL}/auth/callback?accessToken=${accessToken}`);
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }
}