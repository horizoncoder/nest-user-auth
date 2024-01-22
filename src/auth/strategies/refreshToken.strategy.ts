import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as dotenv from 'dotenv';
import {JwtPayloadInterface} from "../../interfeces/auth.interfaces";
dotenv.config();
@Injectable()

export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {

    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_REFRESH_SECRET,
        });
    }

    validate(payload: JwtPayloadInterface) {
       return payload
    }
}
