import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER } from "../env/env";
import { User } from "src/modules/user/entity/user.entity";
import { Goal } from "src/modules/goal/entitiy/goal.entity";
import { RetrospectAnswer } from "src/modules/retrospect/entities/answer.entity";
import { RetrospectQuestion } from "src/modules/retrospect/entities/question.entity";
import { RetrospectSetting } from "src/modules/retrospect/entities/setting.entity";
import { RetrospectSession } from "src/modules/retrospect/entities/session.entity";

export const mysqlConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  synchronize: true,
  charset: 'utf8mb4',
  entities: [
    User,
    Goal,
    RetrospectSetting,
    RetrospectSession,
    RetrospectQuestion,
    RetrospectAnswer
  ]
};