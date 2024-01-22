import {Body, Controller, InternalServerErrorException, Post, Req, Request, Res, UseGuards} from '@nestjs/common';
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
    async signIn(@Res() res: Response, @Body() signInDto: SignInDto): Promise<void> {
        try {
            const tokens = await this.authService.signIn(signInDto);
            (res as any).cookie('accessToken', tokens.accessToken, { maxAge: 1 * 60 * 60 * 60 * 1000, httpOnly: true });
            (res as any).cookie('refreshToken', tokens.refreshToken, { maxAge: 7 * 60 * 60 * 60 * 1000, httpOnly: true });
            // @ts-ignore
            res.status(200).send({message:"successfully"})

        }catch (err: unknown) {
            throw new InternalServerErrorException(err);
        }

    }
    @Post('sign-up')
    @ApiResponse({ status: 200, description: 'User successfully signed up' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
    async signUp( @Res() res: Response, @Body() data: SignUpDto): Promise<TokensInterface> {
        const tokens = await this.authService.signUp(data);
        (res as any).cookie('accessToken', tokens.accessToken, {maxAge: 1*60*60*60*1000, httpOnly: true });
        (res as any).cookie('refreshToken', tokens.refreshToken, {maxAge: 7*60*60*60*1000, httpOnly: true });
        return  tokens

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
