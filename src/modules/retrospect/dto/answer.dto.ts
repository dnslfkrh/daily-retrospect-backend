import { IsNumber, IsString } from "@nestjs/class-validator";
import { AnswerType } from "../enums/retrospect.enum";

export class RetrospectAnswerDto {
  @IsNumber()
  questionId: number;

  @IsString()
  answer: AnswerType;
}