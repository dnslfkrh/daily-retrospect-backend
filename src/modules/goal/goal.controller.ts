import { Controller, Get } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { UserSub } from "src/common/types/Payload";
import { User } from "src/common/decorators/user.decorator";

@Controller('goal')
export class GoalController {
  constructor(
    private readonly goalService: GoalService
  ) { }

  @Get('activated')
  async getActivatedGoals(@User() user: UserSub) {
    return await this.goalService.getActivatedGoals(user);
  }

  @Get('finished')
  async getFinishedGoals(@User() user: UserSub) {
    return await this.goalService.getFinishedGoals(user);
  }
}