import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import process from "node:process";
import {AuthService} from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(private authService: AuthService) {
        super({
            clientID: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            callbackURL: (process.env.NODE_ENV === 'prod'
                ? process.env.PROD_GOOGLE_CALLBACK_URL
                : process.env.LOCAL_GOOGLE_CALLBACK_URL) as string,
            scope: ['email', 'profile'],
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
        const user = await this.authService.validateOAuthLogin(profile);
        return user;
    }

}