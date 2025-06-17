import { IsNumber, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { RetrospectAnswerTypeEnum } from "../enums/answer-type.enum";

export class RetrospectAnswerDto {
  @ApiProperty({
    description: '회고 질문 ID',
    example: 1,
    type: Number,
    required: true
  })
  @IsNumber()
  questionId: number;

  @ApiProperty({
    description: '회고 질문에 대한 답변',
    enum: RetrospectAnswerTypeEnum,
    example: 'TEXT_ANSWER',
    required: true
  })
  @IsString()
  answer: RetrospectAnswerTypeEnum;
}