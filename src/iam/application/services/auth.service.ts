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
import { join } from 'path';
import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { generateUUID } from 'src/shared/utils/generators.util';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { Residence } from 'src/iam/domain/entities/residence.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,

    @InjectRepository(Residence)
    private residenceRepository: Repository<Residence>,

    private readonly jwtService: JwtService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    imageProfile: Buffer | null,
    residence,
    creatorId?: string,
  ) {
    try {
      const { profile, password, userName, roles, email } = createUserDto;
      const passwordBcrypt = bcrypt.hashSync(password, 10);

      let userExist;
      userExist = await this.userRepository.findOne({
        where: { email: email },
        relations: ['profile', 'residence'],
      });
      if (userExist) {
        throw new BadRequestException(
          'There is already a user with that email and username',
        );
      }
      userExist = await this.userRepository.findOne({
        where: { userName: userName },
        relations: ['profile', 'residence'],
      });

      if (userExist) {
        throw new BadRequestException(
          'There is already a user with that username',
        );
      }

      let residenceRes;
      if (creatorId != '0' && creatorId) {
        const creator = await this.userRepository.findOne({
          where: { id: Number(creatorId) },
          relations: ['residence'],
        });
        if (!creator) {
          throw new BadRequestException('Creator not found');
        }
        residenceRes = creator.residence;
      } else {
        const { name, address } = residence;
        residenceRes = this.residenceRepository.create({
          name: name,
          address: address,
        });
        await this.residenceRepository.save(residenceRes);
      }

      let imageUrl = '';
      let logoID = '';
      if (imageProfile) {
        const tempFilePath = join(tmpdir(), profile.fullName);
        writeFileSync(tempFilePath, imageProfile);

        logoID = generateUUID();
        imageUrl = await this.cloudinaryService.uploadFile({
          tempFilePath,
          logoID,
        });
      }

      const auxProfile = {
        fullName: profile.fullName,
        imageUrl: imageUrl,
        imageId: logoID,
        status: STATUS.unverified,
      };
      await this.profileRepository.save(auxProfile);

      const auxUser = {
        profile: { ...auxProfile },
        email,
        userName,
        roles,
        password: passwordBcrypt,
        residence: residenceRes,
      };

      const user = this.userRepository.create(auxUser);
      await this.userRepository.save(user);

      delete user.password;
      delete user.face;

      user.profile;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      console.log('Error:', error);
      this.handleDBErrors(error);
    }
  }

  private async findUser(email?: string, userName?: string) {
    const whereClause = email ? { email } : { userName };
    return this.userRepository.findOne({
      where: whereClause,
      select: {
        email: true,
        password: true,
        roles: true,
        id: true,
        userName: true,
      },
      relations: ['profile', 'residence'],
    });
  }

  async login(loginDto: LoginDto) {
    const { email, userName, password } = loginDto;

    const emailReal = email?.toLowerCase().trim();
    const userNameReal = userName?.toLowerCase().trim();

    const user = await this.findUser(emailReal, userNameReal);

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

    throw new InternalServerErrorException(
      `${error?.response?.message}` || 'check logs',
    );
  }
}
