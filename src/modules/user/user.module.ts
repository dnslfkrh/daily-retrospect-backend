import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './repository/user.repository';
import { User } from './entity/user.entity';
import { ReminderService } from '../reminder/reminder.service';
import { UserController } from './user.controller';
import { AwsModule } from 'src/common/aws/aws.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AwsModule
  ],
  providers: [
    UserService,
    UserRepository,
    ReminderService,
  ],
  exports: [
    UserService,
    UserRepository,
    ReminderService
  ],
  controllers: [
    UserController
  ],
})

export class UserModule { }
