import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from 'src/iam/application/services/user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  getUsers(@Param('userId') id: string) {
    return this.userService.getUsers(id);
  }

  @Get('/fCMToken/:userId')
  async getUserfCMToken(@Param('userId') id: string): Promise<any> {
    try {
      return this.userService.getfCMTokenForUser(id);
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/fCMToken')
  setfCMTokenForUser(
    @Body('userId') userId: string,
    @Body('fcmToken') fcmToken: string,
  ) {
    return this.userService.setfCMTokenForUser(userId, fcmToken);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }

  @Put('/:userId')
  @UseInterceptors(FileInterceptor('file'))
  updateUserProfile(
    @Param('userId') id: string,
    @Body('userName') userName: string,
    @Body('email') email: string,
    @Body('fullName') fullName: string,
    @Body('roles') roles: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!userName || !email || !fullName) {
      throw new HttpException(
        'userName, email and fullName are required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rolesArray = roles.split(',');
    let userId;
    if (!id) {
      throw new HttpException('userId is required', HttpStatus.BAD_REQUEST);
    }
    userId = Number(id);
    return this.userService.updateUserProfile(userId, file?.buffer, {
      userName,
      email,
      fullName,
      rolesArray
    });
  }
}
