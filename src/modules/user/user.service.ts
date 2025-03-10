import { Injectable } from "@nestjs/common";
import { UserProps } from "src/common/types/Props";
import { UserRepository } from "src/repositories/user.repository";

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) { }

  async joinOrAlready(email: string, name: string, google_id: string) {
    let user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      const newUser: UserProps = { email, name, google_id };
      user = await this.userRepository.createUser(newUser);
    }
    return user;
  }
}