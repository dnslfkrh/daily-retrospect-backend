import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Retrospect } from "src/entities/retrospect.entity";
import { RetrospectService } from "./retrospect.service";
import { RetrospectRepository } from "src/repositories/retrospect.repository";
import { RetrospectController } from "./retrospect.controller";
import { UserModule } from "../user/user.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Retrospect]),
    UserModule
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