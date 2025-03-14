import { Injectable } from "@nestjs/common";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
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
}