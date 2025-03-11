import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { GoogleStrategy } from './strategies/google/google.strategy';
import { AccessTokenStrategy } from './strategies/jwt/access.strategy';
import { RefreshTokenStrategy } from './strategies/jwt/refresh.strategy';
import { AccessTokenGuard } from './guards/access.guard';
import { RefreshTokenGuard } from './guards/refresh.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
    }),
    HttpModule,
    UserModule,
  ],
  providers: [
    AuthService,
    UserService,
    GoogleStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    AccessTokenGuard,
    RefreshTokenGuard,
  ],
  controllers: [
    AuthController
  ],
})

export class AuthModule { }