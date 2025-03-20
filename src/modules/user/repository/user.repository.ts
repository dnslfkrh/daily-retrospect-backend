import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { NewUserProps } from "src/common/types/Props";
import { User } from "src/modules/user/entity/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createUser(userData: NewUserProps): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  async findUserIdByCognitoId(sub: string): Promise<number | null> {
    const user = await this.userRepository.findOne({ where: { cognito_id: sub } });
    return user ? user.id : null;
  }
}