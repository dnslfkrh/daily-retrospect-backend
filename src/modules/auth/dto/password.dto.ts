import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({
    description: '기존 비밀번호',
    example: 'OldPassword123!',
    required: true
  })
  @IsString()
  previousPassword: string;

  @ApiProperty({
    description: '새 비밀번호 (8자 이상, 대문자, 소문자, 숫자, 특수문자 포함)',
    example: 'NewPassword123!',
    required: true,
    minLength: 8
  })
  @IsString()
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/[A-Z]/, { message: '새 비밀번호에는 최소 1개의 대문자가 포함되어야 합니다.' })
  @Matches(/[a-z]/, { message: '새 비밀번호에는 최소 1개의 소문자가 포함되어야 합니다.' })
  @Matches(/[0-9]/, { message: '새 비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.' })
  @Matches(/[\W_]/, { message: '새 비밀번호에는 최소 1개의 특수 문자가 포함되어야 합니다.' })
  newPassword: string;
}