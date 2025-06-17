import { Body, Controller, Delete, Get, Post, Query, Req, UnauthorizedException } from "@nestjs/common";
import { UserService } from "./user.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/user-payload.type";
import { ChangePasswordDto } from "../auth/dto/password.dto";
import { Request } from "express";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('사용자')
@ApiBearerAuth()
@Controller("user")
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @ApiOperation({ summary: '사용자 이름 변경' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: '홍길동', description: '변경할 이름' }
      }
    }
  })
  @ApiResponse({ status: 200, description: '이름이 성공적으로 변경되었습니다' })
  @Post("change-name")
  async changeName(@User() user: UserSub, @Body("name") name: string) {
    await this.userService.changeName(user, name);

    return {
      message: "Name changed successfully.",
    };
  }

  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호가 성공적으로 변경되었습니다' })
  @ApiResponse({ status: 401, description: '인증 토큰이 필요합니다' })
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

  @ApiOperation({ summary: '사용자 계정 삭제' })
  @ApiQuery({ name: 'email', description: '삭제할 사용자의 이메일', required: true })
  @ApiResponse({ status: 200, description: '사용자 계정이 성공적으로 삭제되었습니다' })
  @Delete("delete")
  async deleteUser(
    @User() user: UserSub,
    @Query("email") email: string
  ) {
    return await this.userService.deleteUser(user, email);
  }

  @ApiOperation({ summary: '현재 사용자 정보 조회' })
  @ApiResponse({ status: 200, description: '현재 로그인된 사용자의 정보를 반환합니다' })
  @Get("me")
  async getMe(@User() user: UserSub) {
    return await this.userService.getMe(user);
  }

  @ApiOperation({ summary: '사용자 상세 정보 조회' })
  @ApiResponse({ status: 200, description: 'Cognito에 저장된 사용자 상세 정보를 반환합니다' })
  @Get("user-info")
  async getUserInfo(@User() user: UserSub) {
    return await this.userService.getCognitoUser(user);
  }
}