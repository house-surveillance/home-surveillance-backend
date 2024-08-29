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
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { profile, password, userName, roles, email } = createUserDto;

      //  console.log(profile);
      const passwordBcrypt = bcrypt.hashSync(password, 10);

      const auxProfile = {
        fullName: profile.fullName,
        imageUrl: '',
        imageId: '',
        status: STATUS.unverified,
      };
      await this.profileRepository.save(auxProfile);

      const auxUser = {
        profile: { ...auxProfile },
        email,
        userName,
        roles,
        password: passwordBcrypt,
      };

      const existUserByEmail = await this.userRepository.findOne({
        where: { email: email },
      });
      const existUserByUserName = await this.userRepository.findOne({
        where: { userName: userName },
      });

      if (existUserByEmail) {
        throw new BadRequestException(
          'There is already a user with that email and username',
        );
      }

      if (existUserByUserName) {
        throw new BadRequestException(
          'There is already a user with that username',
        );
      }
      const user = this.userRepository.create(auxUser);
      console.log('🚀 ~ AuthService ~ create ~ user:', user);
      await this.userRepository.save(user);
      delete user.password;
      delete user.profile;
      //delete user.account;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginDto: LoginDto) {
    const { email, userName, password } = loginDto;
    let user: { password: string; id: number; userName: string; email: string };
    email
      ? (user = await this.userRepository.findOne({
          where: { email },
          select: {
            email: true,
            password: true,
            roles: true,
            id: true,
            userName: true,
          },
        }))
      : (user = await this.userRepository.findOne({
          where: { userName },
          select: {
            password: true,
            userName: true,
            roles: true,
            id: true,
            email: true,
          },
        }));

    if (!user) throw new UnauthorizedException('invalid username or email');

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('invalid Password');
    }
    delete user.password;

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    const { id, userName, email } = user;
    return {
      id,
      userName,
      email,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    if (error?.response?.statusCode === 400)
      throw new BadRequestException(`${error.response.message}`);
    console.log(error.response.message);
    throw new InternalServerErrorException(
      `${error?.response?.message}` || 'check logs',
    );
  }
}
