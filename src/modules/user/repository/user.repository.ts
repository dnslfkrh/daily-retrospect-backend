import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RetrospectSession } from "src/modules/retrospect/entities/session.entity";
import { User } from "src/modules/user/entity/user.entity";
import { Repository } from "typeorm";
import { InactiveUserProps } from "../types/inactive-user.type";
import { NewUserProps } from "../types/new-user.type";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, is_deleted: false }
    });
  }

  async findEmailByCognitoId(cognitoId: string): Promise<string | null> {
    const user = await this.userRepository.findOne({
      where: { cognito_id: cognitoId, is_deleted: false }
    });
    return user ? user.email : null;
  }

  async createUser(userData: NewUserProps): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return await this.userRepository.save(newUser);
  }

  async findUserIdByCognitoId(sub: string): Promise<number | null> {
    const user = await this.userRepository.findOne({
      where: { cognito_id: sub, is_deleted: false }
    });
    return user ? user.id : null;
  }

  async findInactiveUsers(days: number): Promise<InactiveUserProps[]> {
    return await this.userRepository
      .createQueryBuilder("user")
      .leftJoin(
        RetrospectSession,
        "session",
        "session.userId = user.id AND session.created_at >= NOW() - INTERVAL :days DAY",
        { days }
      )
      .where("session.id IS NULL")
      .andWhere("user.created_at <= NOW() - INTERVAL :minDays DAY", { minDays: days })
      .select(["user.id", "user.name", "user.email"])
      .getMany();
  }

  async markUserAsDeleted(cognitoId: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ is_deleted: true })
      .where("cognito_id = :cognitoId", { cognitoId })
      .execute();
  }

  async unmarkUserAsDeleted(cognitoId: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ is_deleted: false })
      .where("cognito_id = :cognitoId", { cognitoId })
      .execute();
  }

  async deleteUserByCognitoId(cognitoId: string): Promise<void> {
    await this.userRepository
      .createQueryBuilder("user")
      .delete()
      .where("cognito_id = :cognitoId", { cognitoId })
      .execute();
  }
}