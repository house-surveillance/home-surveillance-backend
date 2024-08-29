import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IamModule } from './iam/iam.module';
import { RecognitionModule } from './recognition/recognition.module';
import { NotificationsModule } from './notifications/notifications.module';
import { CamerasModule } from './cameras/cameras.module';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'hs-db',
      autoLoadEntities: true,
      synchronize: true,
      ssl: true,
      migrationsRun: false,
      logging: false,
      //dropSchema: true ,
      bigNumberStrings: false,
      entities: [
        process.env.ENVIRONMENT == 'prod'
          ? './domain/entities/*.entity.js'
          : './dist/domain/entities/*.entity.js',
      ],
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
    }),

    IamModule,
    RecognitionModule,
    NotificationsModule,
    CamerasModule,
    SharedModule,
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
