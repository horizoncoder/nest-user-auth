import {Body, Controller, Post, Req, Request, Res, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import {SignInDto, SignUpDto} from "./auth.dto";
import {TokensInterface} from "../interfeces/auth.interfaces";
import {ApiResponse, ApiTags} from "@nestjs/swagger";
import {RefreshTokenGuard} from "../guard/refresh-token.guard";
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}


    @Post('sign-in')
    @ApiResponse({ status: 200, description: 'User successfully signed in' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    async signIn(@Body() signInDto: SignInDto): Promise<TokensInterface> {
        return await this.authService.signIn(signInDto);
    }
    @Post('sign-up')
    @ApiResponse({ status: 200, description: 'User successfully signed up' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    async signUp(@Body() data: SignUpDto): Promise<TokensInterface> {
        return await this.authService.signUp(data);
    }
    @UseGuards(RefreshTokenGuard)
    @Post('refresh-tokens')
    @ApiResponse({ status: 200, description: 'Refresh tokens successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async refreshTokens(@Req() request: Request): Promise<TokensInterface> {
        const authorizationHeader = request.headers['authorization'];

        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            throw new Error('Bearer token not found in Authorization header');
        }

        const refreshToken = authorizationHeader.slice('Bearer '.length);
        return await this.authService.refreshTokens(refreshToken);
    }
}
