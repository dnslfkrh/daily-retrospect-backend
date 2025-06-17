import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { GoalService } from "./goal.service";
import { UserSub } from "src/common/types/user-payload.type";
import { User } from "src/common/decorators/user.decorator";
import { CreateGoalDto, UpdateGoalDto } from "./dto/goal.dto";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags('목표')
@ApiBearerAuth()
@Controller('goal')
export class GoalController {
  constructor(
    private readonly goalService: GoalService
  ) { }

  @ApiOperation({ summary: '활성화된 목표 목록 조회' })
  @ApiResponse({ status: 200, description: '현재 활성화된(진행 중인) 목표 목록을 반환합니다' })
  @Get('activated')
  async getActivatedGoals(@User() user: UserSub) {
    return await this.goalService.getActivatedGoals(user);
  }

  @ApiOperation({ summary: '완료된 목표 목록 조회' })
  @ApiResponse({ status: 200, description: '완료된 목표 목록을 반환합니다' })
  @Get('finished')
  async getFinishedGoals(@User() user: UserSub) {
    return await this.goalService.getFinishedGoals(user);
  }

  @ApiOperation({ summary: '새 목표 생성' })
  @ApiBody({ type: CreateGoalDto })
  @ApiResponse({ status: 201, description: '목표가 성공적으로 생성되었습니다' })
  @Post("create")
  async createGoal(@User() user: UserSub, @Body() createGoalDto: CreateGoalDto) {
    console.log("createGoalDto: ", createGoalDto);
    return this.goalService.createGoal(user, createGoalDto);
  }

  @ApiOperation({ summary: '목표 정보 수정' })
  @ApiBody({ type: UpdateGoalDto })
  @ApiResponse({ status: 200, description: '목표 정보가 성공적으로 수정되었습니다' })
  @Put("update")
  async updateGoal(@User() user: UserSub, @Body() updateGoalDto: UpdateGoalDto) {
    console.log("updateGoalDto: ", updateGoalDto);
    return this.goalService.updateGoal(user, updateGoalDto);
  }

  @ApiOperation({ summary: '목표 삭제' })
  @ApiParam({ name: 'id', description: '삭제할 목표의 ID', type: 'number' })
  @ApiResponse({ status: 200, description: '목표가 성공적으로 삭제되었습니다' })
  @Delete(":id")
  async deleteGoal(@User() user: UserSub, @Param("id") id: string) {
    return this.goalService.deleteGoal(user, parseInt(id, 10));
  }
}