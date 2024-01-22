import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import {AccessTokenStrategy} from './strategies/accessToken.strategy';
import { UserModule } from '../user/user.module';
import * as dotenv from 'dotenv';
import {RefreshTokenStrategy} from "./strategies/refreshToken.strategy";
dotenv.config();
@Module({
    imports: [
        UserModule,
        PassportModule,
        JwtModule.register({}),
    ],
    providers: [AuthService, AccessTokenStrategy, RefreshTokenStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
