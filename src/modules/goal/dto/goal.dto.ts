import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from "@nestjs/class-validator";

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;
}

export class UpdateGoalDto extends CreateGoalDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}
