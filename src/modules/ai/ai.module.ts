import { Module } from "@nestjs/common";
import { AiService } from "./ai.service";
import { RetrospectModule } from "../retrospect/retrospect.module";

@Module({
  imports: [
    RetrospectModule
  ],
  providers: [
    AiService,
  ],
  controllers: [],
  exports: [
    AiService,
  ]
})

export class AiModule { }