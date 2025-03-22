import { IsNumber, IsString } from "@nestjs/class-validator";

export class RetrospectAnswerDto {
  @IsNumber()
  questionId: number;

  @IsString()
  answer: string
}