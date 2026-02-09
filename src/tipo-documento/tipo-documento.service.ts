import { Injectable } from '@nestjs/common';
import { CreateTipoDocumentoDto } from './dto/create-tipo-documento.dto';
import { UpdateTipoDocumentoDto } from './dto/update-tipo-documento.dto';

@Injectable()
export class TipoDocumentoService {
  create(createTipoDocumentoDto: CreateTipoDocumentoDto) {
    return 'This action adds a new tipoDocumento';
  }

  findAll() {
    return `This action returns all tipoDocumento`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tipoDocumento`;
  }

  update(id: number, updateTipoDocumentoDto: UpdateTipoDocumentoDto) {
    return `This action updates a #${id} tipoDocumento`;
  }

  remove(id: number) {
    return `This action removes a #${id} tipoDocumento`;
  }
}
