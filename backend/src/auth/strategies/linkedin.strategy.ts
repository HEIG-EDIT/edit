import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-linkedin-oauth2';

@Injectable()
export class LinkedInStrategy extends PassportStrategy(Strategy, 'linkedin') {
    constructor() {
        super({
            clientID: process.env.LINKEDIN_CLIENT_ID as string,
            clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
            callbackURL: process.env.LINKEDIN_CALLBACK_URL_LOCAL as string,
            scope: ['r_emailaddress', 'r_liteprofile'],
        });
    }
}
