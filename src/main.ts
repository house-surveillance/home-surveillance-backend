import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as configv1 from 'dotenv';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';

async function bootstrap() {
  configv1.config();
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.use(morgan('combined'));
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('RCA-API')
    .setDescription('Rent Car Assists Api Documentation')
    .setVersion('1.0')
    .addTag('CRA')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({ origin: '*' });
  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`App running on port ${port}`);
}
bootstrap();
