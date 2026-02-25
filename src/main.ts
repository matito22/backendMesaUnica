import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './config/http-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  app.use(cookieParser());

  // ClassSerializerInterceptor hace que @Exclude() en las entidades funcione.
  // Sin esto, la password de Contribuyente se devuelve igual aunque tenga @Exclude()
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const config = new DocumentBuilder()
    .setTitle('MesaUnica')
    .setDescription('')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addTag('mesaunica')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', name: 'Authorization', in: 'header' },
      'JWT'
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
    origin: process.env.CORS_ORIGIN ,
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();