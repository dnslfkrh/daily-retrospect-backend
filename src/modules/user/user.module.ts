import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { ReminderService } from '../reminder/reminder.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    UserService,
    UserRepository,
    ReminderService
  ],
  exports: [
    UserService,
    UserRepository,
    ReminderService
  ],
})

export class UserModule { }
