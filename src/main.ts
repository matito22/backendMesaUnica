import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './config/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());//Para crear el filtro de excepciones global

  app.use(cookieParser());

  //Configuración de Swagger
  const config= new DocumentBuilder()
    .setTitle('MesaUnica')
    .setDescription('')
    .setVersion('1.0')
    .addCookieAuth('access_token')
    .addTag('mesaunica')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      in: 'header',
    },
      'JWT') //Habilitar autenticación Bearer, esto se pone en el controlador con @ApiBearerAuth('JWT') para que funcione
    .build()
    

  const documentFactory =() => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
});


  app.useGlobalPipes(new ValidationPipe()); //Vinculando el pipe de validación globalmente, para que valide todas las entradas
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
