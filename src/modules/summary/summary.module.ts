import { Module } from "@nestjs/common";
import { AiService } from "./ai/ai.service";
import { CalendarService } from "./calendar/calendar.service";
import { GraphService } from "./graph/graph.service";
import { RetrospectModule } from "../retrospect/retrospect.module";

@Module({
  imports: [
    RetrospectModule
  ],
  providers: [
    AiService,
    CalendarService,
    GraphService
  ],
  controllers: [],
  exports: [
    AiService,
    CalendarService,
    GraphService
  ]
})

export class SummaryModule { }