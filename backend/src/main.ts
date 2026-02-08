import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dns from 'dns';
import * as express from 'express';
import { AppModule } from './app.module';

// Configurar DNS para preferir IPv4 (resolver problema de timeout com FCM)
dns.setDefaultResultOrder('ipv4first');
const Porta = process.env.PORT || 3000;
const baseURL =
  `${process.env.URL_BASE_API}:${Porta}` || `http://localhost:${Porta}`;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(new ValidationPipe());
  const config = new DocumentBuilder()
    .setTitle('GDC API')
    .setDescription('The GDC API description')
    .setVersion('1.0')
    .addTag('GDC')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
      'Origin',
      'If-None-Match',
      'Content-Range',
      'Range',
      'Accept-Encoding',
      'Accept-Language',
      'Access-Control-Request-Headers',
      'Access-Control-Request-Method',
    ],
    credentials: false,
  });

  // Configuração para arquivos grandes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  await app.listen(Porta, () => {
    console.log(` `);
    console.log(` `);
    console.log(`\x1b[1m\x1b[34mNest running on ${baseURL}\x1b[0m`);
    console.log(`\x1b[4m\x1b[43m\x1b[30mNest running on ${baseURL}/api\x1b[0m`);
  });
}
void bootstrap();
