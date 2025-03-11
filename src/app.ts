import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { mysqlConfig } from './common/config/database/mysql';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(mysqlConfig),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class App { }
