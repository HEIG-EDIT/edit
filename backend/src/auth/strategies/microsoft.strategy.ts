import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-oauth2';
import process from 'node:process';

@Injectable()
export class MicrosoftStrategy  extends PassportStrategy(Strategy, 'microsoft') {
    constructor() {
        super({
            clientID: process.env.MICROSOFT_CLIENT_ID as string,
            clientSecret: process.env.MICROSOFT_CLIENT_SECRET as string,
            callbackURL: process.env.MICROSOFT_CALLBACK_URL_LOCAL as string,
            scope: ['email', 'profile'],
            authorizationURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
            tokenURL: 'https://login.microsoftonline.com/common/oauth2/v2.0/token'
        });
    }
}