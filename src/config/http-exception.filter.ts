
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)//Este decorador indica que el filtro solo atrapa excepciones que sean instancias de HttpException
//Ej:NotFoundException, ConflictException, UnauthorizedException
export class HttpExceptionFilter implements ExceptionFilter {
    //catch decorador que indica que tipo de excepcion va a manejar
    //ArgumentsHost proporciona acceso al contexto de la petición(request,response)
    //HttpException clase base para todas las excepciones HTTP en NestJS(404,403,etc)
  catch(exception: HttpException, host: ArgumentsHost) {
    //Request representa la petición que hizo el cliente al servidor y Response representa la respuesta que el servidor envía al cliente.
    const ctx = host.switchToHttp();//Extraemos el contexto HTTP del ArgumentsHost.
    const response = ctx.getResponse<Response>();//Obtenemos el objeto de respuesta HTTP.(status,json,etc)
    const request = ctx.getRequest<Request>();//Obtenemos el objeto de solicitud HTTP.(url,method,headers,etc)
    const status = exception.getStatus();//Obtenemos el código de estado HTTP de la excepción.(404,403,etc)
    response//Armamos y enviamos la respuesta HTTP personalizada.
      .status(status)//Establecemos el código de estado HTTP.
      .json({
        statusCode: status,//Incluimos el código de estado en el cuerpo de la respuesta.
        timestamp: new Date().toISOString(),//Incluimos una marca de tiempo.
        path: request.url,//Incluimos la URL de la solicitud que causó la excepción.
        message: exception.message || null,//Incluimos el mensaje de la excepción.
        method: request.method,//Incluimos el método HTTP de la solicitud.
      });
  }
}

