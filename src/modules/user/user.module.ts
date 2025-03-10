import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from '../../repositories/user.repository';
import { User } from '../../entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User])
  ],
  providers: [
    UserService,
    UserRepository
  ],
  exports: [
    UserService,
    UserRepository
  ],
})

export class UserModule { }