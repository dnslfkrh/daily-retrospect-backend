import { Module } from "@nestjs/common";
import { AiService } from "./ai/ai.service";
import { CalendarService } from "./calendar/calendar.service";
import { GraphService } from "./graph/graph.service";

@Module({
  imports: [],
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