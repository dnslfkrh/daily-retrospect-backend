import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Goal } from "src/entities/goal.entity";
import { UserModule } from "../user/user.module";
import { GoalService } from "./goal.service";
import { GoalRepository } from "src/repositories/goal.repository";
import { GoalController } from "./goal.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
    UserModule
  ],
  providers: [
    GoalService,
    GoalRepository
  ],
  controllers: [
    GoalController
  ],
  exports: [
    GoalService,
    GoalRepository
  ]
})

export class GoalModule { }