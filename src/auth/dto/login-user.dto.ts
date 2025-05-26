import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

export class LoginUserDto {

  @ApiProperty({
    example: 'john@example.com',
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'ABc123',
    description: 'Must have a uppercase, lowercase letter, and a number'
  })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(
    /(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number'
  })
  password: string;
}
