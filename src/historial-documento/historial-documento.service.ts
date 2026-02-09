import { Injectable } from '@nestjs/common';
import { CreateHistorialDocumentoDto } from './dto/create-historial-documento.dto';
import { UpdateHistorialDocumentoDto } from './dto/update-historial-documento.dto';

@Injectable()
export class HistorialDocumentoService {
  create(createHistorialDocumentoDto: CreateHistorialDocumentoDto) {
    return 'This action adds a new historialDocumento';
  }

  findAll() {
    return `This action returns all historialDocumento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} historialDocumento`;
  }

  update(id: number, updateHistorialDocumentoDto: UpdateHistorialDocumentoDto) {
    return `This action updates a #${id} historialDocumento`;
  }

  remove(id: number) {
    return `This action removes a #${id} historialDocumento`;
  }
}
