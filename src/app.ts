import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig } from './common/config/database/mysql';

@Module({
  imports: [
    TypeOrmModule.forRoot(mysqlConfig),
  ],
  controllers: [],
  providers: [],
})
export class App { }
