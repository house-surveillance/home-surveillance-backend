import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { User } from '../../domain/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/iam/application/dtos/user/create-user.dto';
import { AuthService } from 'src/iam/application/services/auth.service';
import { LoginDto } from 'src/iam/application/dtos/user/login.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProfileDto } from 'src/iam/application/dtos/profile/create-profile.dto';

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
  @UseInterceptors(FileInterceptor('file'))
  createUser(
    @UploadedFile() file: Express.Multer.File,
    @Body('userName') userName: string,
    @Body('email') email: string,
    @Body('password') password: string,
    @Body('roles') roles: string,
    @Body('fullName') fullName: string,
    //@Body() createUserDto: CreateUserDto
  ) {
    const createUserDto = new CreateUserDto();
    const rolesArray = roles.split(',');
    
    createUserDto.email = email;
    createUserDto.userName = userName;
    createUserDto.password = password;
    createUserDto.roles = rolesArray;

    const createProfileDto = new CreateProfileDto();
    createProfileDto.fullName = fullName;
    createUserDto.profile = createProfileDto;

    return this.authService.create(createUserDto, file.buffer ?? null);
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
