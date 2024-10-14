import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { UserService } from 'src/iam/application/services/user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('/:userId')
  getUsers(@Param('userId') id: string) {
    console.log('🚀 ~ UsersController ~ getUsers ~ id', id);
    return this.userService.getUsers(id);
  }

  @Get('/fCMToken/:userId')
  async getUserfCMToken(@Param('userId') id: string): Promise<any> {
    try {
      console.log('🚀 ~ UsersController ~ fCMToken ~ id', id);
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
}
