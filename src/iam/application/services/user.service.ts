import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/iam/domain/entities/user.entity';
import { Profile } from 'src/iam/domain/entities/profile.entity';
import { Residence } from 'src/iam/domain/entities/residence.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Residence)
    private readonly residenceRepository: Repository<Residence>,
  ) {}

  async getUsers(id: string) {
    try {
      if (!id) {
        return await this.userRepository.find({
          relations: ['profile', 'face'],
        });
      }
      const user = await this.userRepository.findOne({
        where: { id: Number(id) },
        relations: ['profile', 'face', 'residence'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Obtener el ID de la residencia del usuario
      const residenceId = user.residence.id;

      // Obtener todos los usuarios que tienen la misma residencia
      const usersWithSameResidence = await this.userRepository.find({
        where: { residence: { id: residenceId } },
        relations: ['profile', 'face'],
      });
      console.log(
        '🚀 ~ UserService ~ getUsers ~ usersWithSameResidence:',
        usersWithSameResidence,
      );

      return usersWithSameResidence;
    } catch (error) {
      console.log('Error:', error);
      this.handleDBErrors(error);
    }
  }

  async getfCMTokenForUser(id: string) {
    const userId = Number(id);

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['fcmToken'],
    });
    const fcmToken = user?.fcmToken;

    if (!fcmToken) {
      throw new NotFoundException('FCM Token not found');
    }
    return fcmToken;
  }

  async setfCMTokenForUser(userId: string, fcmToken: string) {
    try {
      const id = Number(userId);
      const res = await this.userRepository.update(
        { id: id },
        { fcmToken: fcmToken },
      );
      console.log(res);
      return res;
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

  async deleteUser(id: string) {
    try {
      const res = await this.userRepository.delete({ id: Number(id) });
      return res;
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
