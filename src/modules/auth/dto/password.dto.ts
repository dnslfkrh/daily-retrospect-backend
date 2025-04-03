import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  previousPassword: string;

  @IsString()
  @MinLength(8, { message: '새 비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/[A-Z]/, { message: '새 비밀번호에는 최소 1개의 대문자가 포함되어야 합니다.' })
  @Matches(/[a-z]/, { message: '새 비밀번호에는 최소 1개의 소문자가 포함되어야 합니다.' })
  @Matches(/[0-9]/, { message: '새 비밀번호에는 최소 1개의 숫자가 포함되어야 합니다.' })
  @Matches(/[\W_]/, { message: '새 비밀번호에는 최소 1개의 특수 문자가 포함되어야 합니다.' })
  newPassword: string;
}
