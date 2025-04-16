import { Module } from "@nestjs/common";
import { ReminderService } from "./reminder.service";
import { AwsModule } from "../aws/aws.module";

@Module({
  imports: [
    AwsModule
  ],
  providers: [
    ReminderService,
  ],
  exports: [
    ReminderService
  ]
})

export class ReminderModule { }