import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RetrospectService } from "./retrospect.service";
import { RetrospectRepository } from "src/modules/retrospect/repository/retrospect.repository";
import { RetrospectController } from "./retrospect.controller";
import { UserModule } from "../user/user.module";
import { GoalModule } from "../goal/goal.module";
import { RetrospectAnswer } from "./entities/answer.entity";
import { RetrospectQuestion } from "./entities/question.entity";
import { RetrospectSetting } from "./entities/setting.entity";
import { RetrospectSession } from "./entities/session.entity";
import { RetrospectSummary } from "./entities/summary.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RetrospectSetting,
      RetrospectSession,
      RetrospectQuestion,
      RetrospectAnswer,
      RetrospectSummary
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