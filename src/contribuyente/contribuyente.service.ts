import { Injectable } from '@nestjs/common';
import { CreateContribuyenteDto } from './dto/create-contribuyente.dto';
import { UpdateContribuyenteDto } from './dto/update-contribuyente.dto';

@Injectable()
export class ContribuyenteService {
  create(createContribuyenteDto: CreateContribuyenteDto) {
    return 'This action adds a new contribuyente';
  }

  findAll() {
    return `This action returns all contribuyente`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contribuyente`;
  }

  update(id: number, updateContribuyenteDto: UpdateContribuyenteDto) {
    return `This action updates a #${id} contribuyente`;
  }

  remove(id: number) {
    return `This action removes a #${id} contribuyente`;
  }
}
