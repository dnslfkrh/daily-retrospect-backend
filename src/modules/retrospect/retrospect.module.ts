import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RetrospectService } from "./retrospect.service";
import { RetrospectController } from "./retrospect.controller";
import { UserModule } from "../user/user.module";
import { GoalModule } from "../goal/goal.module";
import { RetrospectAnswer } from "./entities/answer.entity";
import { RetrospectQuestion } from "./entities/question.entity";
import { RetrospectSetting } from "./entities/setting.entity";
import { RetrospectSession } from "./entities/session.entity";
import { RetrospectSummary } from "./entities/summary.entity";
import { RetrospectQuestionUsage } from "./entities/question-usage.entity";
import { RetrospectQuestionService } from "./services/question.service";
import { RetrospectSessionService } from "./services/session.service";
import { RetrospectSettingService } from "./services/setting.service";
import { RetrospectSummaryService } from "./services/summary.service";
import { RetrospectAnswerRepository } from "./repositories/answer.repository";
import { RetrospectQuestionRepository } from "./repositories/question.repository";
import { RetrospectSessionRepository } from "./repositories/session.repository";
import { RetrospectSettingRepository } from "./repositories/setting.repository";
import { RetrospectSummaryRepository } from "./repositories/summary.repository";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RetrospectSetting,
      RetrospectSession,
      RetrospectQuestion,
      RetrospectAnswer,
      RetrospectSummary,
      RetrospectQuestionUsage
    ]),
    UserModule,
    GoalModule
  ],
  providers: [
    RetrospectService,
    RetrospectQuestionService,
    RetrospectSessionService,
    RetrospectSettingService,
    RetrospectSummaryService,
    RetrospectAnswerRepository,
    RetrospectQuestionRepository,
    RetrospectSessionRepository,
    RetrospectSettingRepository,
    RetrospectSummaryRepository
  ],
  controllers: [
    RetrospectController
  ],
  exports: [
    RetrospectService
  ]
})

export class RetrospectModule { }