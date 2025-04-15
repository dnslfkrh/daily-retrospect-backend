import { Module } from "@nestjs/common";
import { ReminderService } from "./reminder.service";
import { AWSClient } from "src/common/aws/aws.client";
import { AwsModule } from "src/common/aws/aws.module";

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