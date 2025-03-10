import { InjectRepository } from "@nestjs/typeorm";
import { NewUserProps } from "src/common/types/Props";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async createUser(user: NewUserProps): Promise<User> {
    return await this.userRepository.save(user);
  }
}