import { IsEmail, IsNotEmpty } from 'class-validator';

export class ConfirmDeleteUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}