import { IsEmail, IsNotEmpty, IsString, MinLength, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'John', description: 'The name of the user' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'Doe', description: 'The surname of the user' })
    @IsNotEmpty()
    @IsString()
    surname: string;

    @ApiProperty({ example: 'password123', description: 'The password of the user (min length: 6)' })
    @IsNotEmpty()
    @MinLength(6)
    password: string;

}
export class SignInDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', description: 'The password of the user' })
    @IsNotEmpty()
    @IsString()
    password: string;
}
