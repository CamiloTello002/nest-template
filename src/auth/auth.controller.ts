import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, SetMetadata, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { RawHeaders } from './decorators/raw-headers.decorator';
import { UserRoleGuard } from './guards/user-role.guard';
import { RoleProtected } from './decorators/role-protected.decorator';
import { ValidRoles } from './interfaces/valid-roles.enum';
import { Auth } from './decorators/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  async loginUser(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) response: any
  ) {
    const { token, ...userData } = await this.authService.login(loginUserDto);
    
    // Set token as HTTP-only cookie
    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // use secure in production
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
    });
    
    return userData;
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser() user: User
  ) {
    return this.authService.checkAuthStatus(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    @GetUser() user: User,
    @GetUser('email') userEmail: string,
    @RawHeaders() rawHeaders: string[]
  ) {
    return { user, userEmail, rawHeaders }
  }

  @Get('private2')
  @RoleProtected(ValidRoles.superUser, ValidRoles.admin) // this just sets the metadata
  @UseGuards(AuthGuard(), UserRoleGuard) // and this performs authentication and authorization
  testingPrivateRoute2(
    @GetUser() user: User,
  ) {
    return { ok: true, user }
  }

  @Get('private3')
  @Auth()
  testingPrivateRoute3(
    @GetUser() user: User,
  ) {
    return { ok: true, user }
  }
}
