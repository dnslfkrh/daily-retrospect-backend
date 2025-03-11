import { Injectable } from "@nestjs/common";
import { NewUserProps } from "src/common/types/Props";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async joinOrAlready(userInfo: NewUserProps) {
    let user = await this.userRepository.findUserByEmail(userInfo.email);
    if (!user) {
      user = await this.userRepository.createUser(userInfo);
    }
    return user;
  }
}