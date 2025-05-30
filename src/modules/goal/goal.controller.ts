import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { UserSub } from "src/common/types/user-payload.type";
import { User } from "src/common/decorators/user.decorator";
import { CreateGoalDto, UpdateGoalDto } from "./dto/goal.dto";

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

  @Post("create")
  async createGoal(@User() user: UserSub, @Body() createGoalDto: CreateGoalDto) {
    console.log("createGoalDto: ", createGoalDto);
    return this.goalService.createGoal(user, createGoalDto);
  }

  @Put("update")
  async updateGoal(@User() user: UserSub, @Body() updateGoalDto: UpdateGoalDto) {
    console.log("updateGoalDto: ", updateGoalDto);
    return this.goalService.updateGoal(user, updateGoalDto);
  }

  @Delete(":id")
  async deleteGoal(@User() user: UserSub, @Param("id") id: string) {
    return this.goalService.deleteGoal(user, parseInt(id, 10));
  }
}