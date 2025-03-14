import { Controller, Get } from "@nestjs/common";
import { RetrospectService } from "./retrospect.service";
import { User } from "src/common/decorators/user.decorator";
import { UserSub } from "src/common/types/Payload";

@Controller('retrospect')
export class RetrospectController {
  constructor(
    private readonly retrospectService: RetrospectService
  ) { }

  @Get('today')
  async getTodayRetroSpect(@User() user: UserSub) {
    console.log(user);
    return await this.retrospectService.getTodayRetroSpect(user);
  }
}