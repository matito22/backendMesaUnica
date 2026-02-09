import { HttpException } from "@nestjs/common";

//Armamos una clase base para manejar errores comunes de httpException y no repetir este codigo
//throw new NotFoundException(`User with ID ${idUser} not found`);
export class HandleService {

    //Pasamos la entidad a verificar, el tipo de excepción a lanzar y el mensaje
    //T significa que es un tipo generico, puede ser cualquier entidad
  protected handleException<T>(entity: T | null, ExceptionType: new (msg: string) => HttpException, message: string): T {
  if (!entity) throw new ExceptionType(message);
  return entity;
}

protected throwException(exception: any, message: string): never {
    throw new exception(message);
  }

  //Para duplicados
  protected handleDuplicate<T>(entity: T | null, ExceptionType: new (msg: string) => HttpException, message: string): void {
  if (entity) throw new ExceptionType(message);
}


}

  