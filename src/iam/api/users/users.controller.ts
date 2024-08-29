import { Controller, Get } from '@nestjs/common';
import { UserService } from 'src/iam/application/services/user.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}
