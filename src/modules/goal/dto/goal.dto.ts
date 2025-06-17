import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateGoalDto {
  @ApiProperty({
    description: '목표 제목',
    example: '주 3회 운동하기',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '목표에 대한 상세 설명',
    example: '건강 관리를 위해 매주 월/수/금에 30분 이상 걷기',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: '목표 시작일 (YYYY-MM-DD 형식)',
    example: '2025-06-20',
    required: true
  })
  @IsDateString()
  start_date: string;

  @ApiProperty({
    description: '목표 종료일 (YYYY-MM-DD 형식)',
    example: '2025-07-20',
    required: true
  })
  @IsDateString()
  end_date: string;
}

export class UpdateGoalDto extends CreateGoalDto {
  @ApiProperty({
    description: '수정할 목표의 ID',
    example: 1,
    required: true
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;
}