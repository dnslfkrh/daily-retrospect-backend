import { Module } from "@nestjs/common";
import { ReminderService } from "./reminder.service";
import { UserModule } from "../user/user.module";

@Module({
  providers: [
    ReminderService,
  ],
  exports: [
    ReminderService
  ]
})

export class ReminderModule { }