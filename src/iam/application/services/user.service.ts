import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from 'src/iam/domain/entities/user.entity';
import { CreateUserDto } from '../dtos/user/create-user.dto';
import { LoginDto } from '../dtos/user/login.dto';
import { JwtPayload } from 'src/iam/domain/interfaces/jwt-payload.interface';
import { STATUS } from 'src/iam/domain/constants/status.contstant';
import { Profile } from 'src/iam/domain/entities/profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getUsers() {
    try {
      return await this.userRepository.find({
        relations: ['profile', 'face'],
      });
    } catch (error) {
      console.log('Error:', error);
      this.handleDBErrors(error);
    }
  }

  async getUserById(id: number) {
    try {
      return await this.userRepository.findOne({
        where: { id },
        relations: ['profile', 'face'],
      });
    } catch (error) {
      console.log('Error:', error);
      this.handleDBErrors(error);
    }
  }

  async updateProfile(id: number, data: any) {
    try {
      return await this.profileRepository.update(id, data);
    } catch (error) {
      console.log('Error:', error);
      this.handleDBErrors(error);
    }
  }

  private handleDBErrors(error: any): never {
    if (error?.response?.statusCode === 400)
      throw new BadRequestException(`${error.response.message}`);
    console.log(error?.response?.message);
    throw new InternalServerErrorException(
      `${error?.response?.message}` || 'check logs',
    );
  }
}
