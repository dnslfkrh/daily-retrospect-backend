import { Inject, Injectable } from "@nestjs/common";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { ReminderService } from "../reminder/reminder.service";

@Injectable()
export class UserService {
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
}