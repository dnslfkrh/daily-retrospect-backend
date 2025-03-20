import { Injectable } from "@nestjs/common";
import { UserSub } from "src/common/types/Payload";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { UserRepository } from "src/modules/user/repository/user.repository";

@Injectable()
export class RetrospectService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly retrospectRepository: RetrospectRepository
  ) { }
}