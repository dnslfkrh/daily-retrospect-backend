import { Body, Controller, Delete, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { ChangePasswordDto } from "../auth/dto/password.dto";
import { Request } from "express";

@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

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

    await this.userService.changePassword(user, body, accessToken);
    return { message: "Password changed successfully" };
  }

  @Delete("delete")
  async deleteUser(
    @User() user: UserSub,
    @Query("email") email: string
  ) {
    return await this.userService.deleteUser(user, email);
  }

  @Get("user-info")
  async getUserInfo(@User() user: UserSub) {
    return await this.userService.getCognitoUser(user);
  }
}
