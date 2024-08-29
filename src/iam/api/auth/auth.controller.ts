import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/iam/application/dtos/user/create-user.dto';
import { AuthService } from 'src/iam/application/services/auth.service';
import { LoginDto } from 'src/iam/application/dtos/user/login.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
  }),
)
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() LoginAccountDto: LoginDto) {
    return this.authService.login(LoginAccountDto);
  }

  // @Get('check-status')
  // @Auth()
  // checkAuthStatus(@GetUser() user: User) {
  //   return this.authService.checkAuthStatus(user);
  // }

  // @Get('private')
  // @UseGuards(AuthGuard())
  // testingPrivateRoute(@Req() request: Express.Request, @GetUser() user: User) {
  //   return {
  //     ok: true,
  //     message: 'Hola Mundo Private',
  //     user,
  //   };
  // }

  // // @SetMetadata('roles', ['admin','super-user'])

  // @Get('private2')
  // @RoleProtected(ValidRoles.admin, ValidRoles.owner)
  // @UseGuards(AuthGuard(), UserRoleGuard)
  // privateRoute2(@GetUser() user: User) {
  //   return {
  //     ok: true,
  //     user,
  //   };
  // }

  // @Get('private3')
  // @Auth(ValidRoles.admin)
  // privateRoute3(@GetUser() user: User) {
  //   return {
  //     ok: true,
  //     user,
  //   };
  // }
}
