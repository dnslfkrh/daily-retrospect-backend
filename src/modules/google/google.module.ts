import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleService } from './google.service';
import { GoogleTokenRepository } from '../../repositories/google-token.repository';
import { GoogleToken } from '../../entities/google-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleToken])
  ],
  providers: [
    GoogleService,
    GoogleTokenRepository
  ],
  exports: [
    GoogleService,
    GoogleTokenRepository
  ],
})

export class GoogleModule { }