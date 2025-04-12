import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "src/modules/user/entity/user.entity";
import { Goal } from "src/modules/goal/entity/goal.entity";
import { RetrospectAnswer } from "src/modules/retrospect/entities/answer.entity";
import { RetrospectQuestion } from "src/modules/retrospect/entities/question.entity";
import { RetrospectSetting } from "src/modules/retrospect/entities/setting.entity";
import { RetrospectSession } from "src/modules/retrospect/entities/session.entity";
import { RetrospectSummary } from "src/modules/retrospect/entities/summary.entity";
import { RetrospectQuestionUsage } from "src/modules/retrospect/entities/question-usage.entity";

export const getMysqlConfig = (): TypeOrmModuleOptions => ({
  type: 'mysql',
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  synchronize: false,
  charset: 'utf8mb4',
  entities: [
    User,
    Goal,
    RetrospectSetting,
    RetrospectSession,
    RetrospectQuestion,
    RetrospectAnswer,
    RetrospectSummary,
    RetrospectQuestionUsage
  ],
  timezone: '+09:00',
});