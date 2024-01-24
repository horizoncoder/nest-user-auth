import {
  Body,
  Controller,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto, SignUpDto } from './auth.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RefreshTokenGuard } from '../guard/refresh-token.guard';
import { Response } from 'express';
import { AccessTokenGuard } from "../guard/access-token.guard";
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private setCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    // HttpOnly flag - to prevent the token from being read from JavaScript.
    // The secure=true flag, which will cause data to be transmitted only over HTTPS.
    // The SameSite=strict flag should be used whenever possible, which will protect against CSRF attacks. This approach should only be used if the authorization server is from the same site as the frontend of the system.

    res.cookie('accessToken', accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: false,
      secure: false,
      sameSite: 'strict',
    }); // 15 min);
    res.cookie('refreshToken', refreshToken, {
      maxAge: 7 * 60 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    }); // 7 days);
  }

  @Post('sign-in')
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @UsePipes(ValidationPipe)
  async signIn(
    @Res() res: Response,
    @Body() signInDto: SignInDto,
  ): Promise<void> {
    try {
      const tokens = await this.authService.signIn(signInDto);
      this.setCookies(res, tokens.accessToken, tokens.refreshToken);
      res.status(200).send({ message: 'successfully' });
    } catch (err: unknown) {
      throw err;
    }
  }
  @Post('sign-up')
  @ApiResponse({ status: 200, description: 'User successfully signed up' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @UsePipes(ValidationPipe)
  async signUp(@Res() res: Response, @Body() data: SignUpDto): Promise<void> {
    try {
      const tokens = await this.authService.signUp(data);
      this.setCookies(res, tokens.accessToken, tokens.refreshToken);
      res.status(201).send({ message: 'successfully' });
    } catch (err: unknown) {
      throw err;
    }
  }
  @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  @ApiResponse({ status: 200, description: 'Refresh tokens successful' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async refreshTokens(
    @Res() res: Response,
    @Req() request: Request,
  ): Promise<void> {
    try {
      const authorizationHeader = request.headers['authorization'];

      if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
        throw new Error('Bearer token not found in Authorization header');
      }
      const refreshToken = authorizationHeader.slice('Bearer '.length);
      const tokens = await this.authService.refreshTokens(refreshToken);
      this.setCookies(res, tokens.accessToken, tokens.refreshToken);
      res.status(200).send({ message: 'successfully' });
    } catch (err: unknown) {
      throw err;
    }
  }

  @Post('logOut')
  @ApiResponse({ status: 200, description: 'User successfully log out' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid credentials',
  })
  @UseGuards(AccessTokenGuard)
  @ApiBearerAuth()
  async logOut(@Res() res: Response): Promise<void> {
    try {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      res.status(200).send({ message: 'successfully' });
    } catch (err: unknown) {
      throw err;
    }
  }
}
