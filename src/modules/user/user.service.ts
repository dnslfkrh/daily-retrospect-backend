import { BadRequestException, Inject, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { ReminderService } from "../reminder/reminder.service";
import { UserSub } from "src/common/types/user-payload.type";
import { AdminDeleteUserCommand, CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { AWS_COGNITO_USER_POOL_ID, AWS_REGION, AWS_SES_ACCESS_KEY, AWS_SES_SECRET_KEY } from "src/common/config/env/env";
import { ConfirmDeleteUserDto } from "./dto/email.dto";

@Injectable()
export class UserService {
  private cognitoClient = new CognitoIdentityProviderClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_SES_ACCESS_KEY,
      secretAccessKey: AWS_SES_SECRET_KEY
    }
  });

  constructor(
    private readonly userRepository: UserRepository,
    private readonly reminderService: ReminderService
  ) { }

  async joinOrAlready(userInfo: { sub: string; name: string; email: string }) {
    const { sub, name, email } = userInfo;

    let user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      user = await this.userRepository.createUser({
        name,
        email,
        cognito_id: sub,
      });
    }

    return user;
  }
  
  async findByCognitoId(cognito_id: string) {
    return await this.userRepository.findUserIdByCognitoId(cognito_id);
  }

  async sendRemindersToInactiveUsers(days: number) {
    const inactiveUsers = await this.userRepository.findInactiveUsers(days);

    await Promise.all(
      inactiveUsers
        .filter(user => user.email && user.email.includes('@'))
        .map(user =>
          this.reminderService.sendReminderEmail(user.email.trim(), user.name.trim())
        )
    );
  }

  async deleteUser(user: UserSub, email: string) {
    const username = user.sub;
    if (!username) {
      throw new UnauthorizedException("Cognito 사용자 삭제 실패");
    }

    const foundEmail = await this.userRepository.findEmailByCognitoId(username);
    if (!foundEmail || foundEmail !== email) {
      throw new BadRequestException("이메일이 일치하지 않습니다.");
    }

    try {
      await this.userRepository.markUserAsDeleted(username);
    } catch (err) {
      console.error("DB 사용자 soft-delete 실패", err);
      throw new InternalServerErrorException("DB 사용자 삭제 실패");
    }

    try {
      await this.cognitoClient.send(
        new AdminDeleteUserCommand({
          UserPoolId: AWS_COGNITO_USER_POOL_ID,
          Username: username,
        })
      );
    } catch (err) {
      console.error("Cognito 사용자 삭제 실패", err);

      try {
        await this.userRepository.unmarkUserAsDeleted(username);
      } catch (rollbackErr) {
        console.error("DB 복원 실패 - 데이터 불일치 가능성 있음", rollbackErr);
      }

      throw new InternalServerErrorException("Cognito 사용자 삭제 실패. 다시 시도해주세요.");
    }

    try {
      await this.userRepository.deleteUserByCognitoId(username);
    } catch (finalErr) {
      console.error("최종 DB 사용자 삭제 실패", finalErr);
    }

    return { success: true, message: "회원 탈퇴 성공" };
  }
}