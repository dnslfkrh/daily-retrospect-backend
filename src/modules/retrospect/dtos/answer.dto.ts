import { IsNumber, IsString } from "@nestjs/class-validator";
import { RetrospectAnswerTypeEnum } from "../enums/answer-type.enum";

export class RetrospectAnswerDto {
  @IsNumber()
  questionId: number;

  @IsString()
  answer: RetrospectAnswerTypeEnum;
}