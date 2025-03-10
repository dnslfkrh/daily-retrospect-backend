import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GoogleToken } from "src/entities/google-token.entity";
import { Repository } from "typeorm";

@Injectable()
export class GoogleTokenRepository {
  constructor(
    @InjectRepository(GoogleToken)
    private readonly googleTokenRepository: Repository<GoogleToken>
  ) { }

  async findGoogleTokenByGoogleId(google_id: string): Promise<GoogleToken | undefined> {
    return this.googleTokenRepository.findOne({ where: { google_id } });
  }
  async saveGoogleToken(googleToken: GoogleToken): Promise<GoogleToken> {
    return this.googleTokenRepository.save(googleToken);
  }
  async findGoogleTokenByUserId(userId: number): Promise<GoogleToken> {
    return this.googleTokenRepository.findOne({ where: { user_id: userId } });
  }
}
