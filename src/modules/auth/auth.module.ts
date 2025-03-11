import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategy/token.strategy';
import { JwtAuthGuard } from './guard/token.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
    }),
    HttpModule,
    UserModule,
    ConfigModule,
  ],
  providers: [
    AuthService,
    UserService,
    JwtStrategy,
    JwtAuthGuard,
  ],
  controllers: [
    AuthController
  ],
})

export class AuthModule { }
