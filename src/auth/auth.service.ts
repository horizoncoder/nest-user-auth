import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { SignInDto, SignUpDto } from './auth.dto';
import { TokensInterface } from '../interfeces/auth.interfaces';
import * as dotenv from 'dotenv';
import * as process from 'process';
dotenv.config();
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async generateTokens(payload: {
    id: number;
    role: number;
  }): Promise<TokensInterface> {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
        secret: process.env.JWT_SECRET,
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '7d',
        secret: process.env.JWT_REFRESH_SECRET,
      }),
    };
  }

  async signUp(data: SignUpDto): Promise<TokensInterface> {
    const { email, name, surname, password } = data;
    const existingUser = await this.userService.isUserExist(data.email);
    if (existingUser) {
      throw new Error('Email is already taken');
    }
    const hashedPassword = await this.userService.hashPassword(password);
    const newUser = await this.userService.create({
      email,
      name,
      surname,
      password: hashedPassword,
      role: 2,
      isBanned: false,
    });

    return await this.generateTokens({ id: newUser.id, role: newUser.role.id });
  }

  async signIn(signInDto: SignInDto): Promise<TokensInterface> {
    const { email, password } = signInDto;

    // Check if the user exists
    const user = await this.userService.findOneByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if the password is correct
    const isPasswordValid = await this.userService.comparePasswords(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return await this.generateTokens({ id: user.id, role: user.role.id });
  }

  async refreshTokens(token: string): Promise<TokensInterface> {
    // Verify the refresh token
    const decodedToken = this.jwtService.verify(token, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    const email = (decodedToken as any).email; // Extract email from the token

    // Check if the user with the email exists (you might want to add more checks)
    const user = await this.userService.findOneByEmail(email);

    if (!user) {
      throw new Error('User not found');
    }

    // Generate a new access token
    return await this.generateTokens({ id: user.id, role: user.role.id });
  }
}
