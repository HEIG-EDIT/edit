import { Body, Controller, Get, Post, Req, Res, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { Response } from 'express';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  //Add HTTP responses and guards for the endpoints (+swagger)
  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.authService.registerUser(body);
  }

  //TODO: Add HTTP responses and guards for the endpoints (+swagger)
  @Get('confirm-email')
  async confirmEmail(@Query('token') token: string, @Res() res: Response) {
    const redirectUrl = await this.authService.confirmEmail(token);
    return res.redirect(302, redirectUrl.email);
  }

  //TODO: Add HTTP responses and guards for the endpoints (+swagger)
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.loginUser(body);
  }

  //TODO
  //Placeholder for logout functionality
  //@Post('logout')
  //logout(@Req() req: Request, @Res() res: Response) {}

  //---------------------------API for Token Handling--------------------------------------

  //TODO
  // Placeholder for access token refresh
  //@Post('refresh')
  //refresh(@Body() body: { refreshToken: string }) {}

  //--------------------------API for Provider LogIn--------------------------------------

  //TODO
  // Placeholder for Google login
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  //TODO
  // Placeholder for Google login callback
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback() {}

  //TODO
  // Placeholder for LinkedIn login
  @Get('linkedin')
  @UseGuards(AuthGuard('linkedin'))
  linkedinLogin() {}

  //TODO
  // Placeholder for LinkedIn login callback
  @Get('linkedin/callback')
  @UseGuards(AuthGuard('linkedin'))
  async linkedinAuthCallback() {}

  //TODO
  // Placeholder for Microsoft login
  @Get('microsoft')
  @UseGuards(AuthGuard('microsoft'))
  microsoftLogin() {}

  //TODO
  // Placeholder for Microsoft login callback
  @Get('microsoft/callback')
  @UseGuards(AuthGuard('microsoft'))
  async microsoftAuthCallback() {}

  // TODO : X and Facebook login and callback
}
