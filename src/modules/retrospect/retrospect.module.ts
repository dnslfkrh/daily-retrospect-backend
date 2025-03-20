import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RetrospectService } from "./retrospect.service";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { RetrospectController } from "./retrospect.controller";
import { UserModule } from "../user/user.module";
import { GoalModule } from "../goal/goal.module";
import { RetrospectAnswer } from "./entity/answer.entity";
import { RetrospectQuestion } from "./entity/question.entity";
import { RetrospectSetting } from "./entity/setting.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RetrospectSetting,
      RetrospectQuestion,
      RetrospectAnswer
    ]),
    UserModule,
    GoalModule
  ],
  providers: [
    RetrospectService,
    RetrospectRepository,
  ],
  controllers: [
    RetrospectController
  ],
  exports: [
    RetrospectService,
    RetrospectRepository,
  ]
})

export class RetrospectModule { }