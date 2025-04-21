import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { User } from "src/modules/user/entity/user.entity";
import { Goal } from "src/modules/goal/entity/goal.entity";
import { RetrospectAnswer } from "src/modules/retrospect/entities/answer.entity";
import { RetrospectQuestion } from "src/modules/retrospect/entities/question.entity";
import { RetrospectSetting } from "src/modules/retrospect/entities/setting.entity";
import { RetrospectSession } from "src/modules/retrospect/entities/session.entity";
import { RetrospectSummary } from "src/modules/retrospect/entities/summary.entity";
import { RetrospectQuestionUsage } from "src/modules/retrospect/entities/question-usage.entity";
import { DailyImage } from "src/modules/image/entity/daily-image.entity";
import { ConfigService } from "@nestjs/config";

export const getMysqlConfig = async (
  configService: ConfigService
): Promise<TypeOrmModuleOptions> => ({
  type: 'mysql',
  username: configService.get<string>('DB_USER'),
  password: configService.get<string>('DB_PASSWORD'),
  host: configService.get<string>('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  database: configService.get<string>('DB_DATABASE'),
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
    RetrospectQuestionUsage,
    DailyImage
  ],
  timezone: '+09:00',
});