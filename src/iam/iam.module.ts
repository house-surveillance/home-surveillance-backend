import { Module } from '@nestjs/common';
import { UsersController } from './api/users/users.controller';
import { AuthController } from './api/auth/auth.controller';
import { AuthService } from './application/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { User } from './domain/entities/user.entity';

import { Profile } from './domain/entities/profile.entity';
import { UserService } from './application/services/user.service';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { Residence } from './domain/entities/residence.entity';

@Module({
  controllers: [UsersController, AuthController],
  providers: [AuthService, UserService, JwtStrategy, CloudinaryService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Profile,Residence]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule, UserService],
})
export class IamModule {}
