import {Controller,Get,Post,Patch,Delete,Param,Body, ParseIntPipe,HttpCode,HttpStatus,} from '@nestjs/common';
import { RequisitoTipoExpedienteService } from './requisito-tipo-expediente.service';
import { RequisitoTipoExpediente } from './entities/requisito-tipo-expediente.entity';
import { CreateRequisitoTipoExpedienteDto } from './dto/create-requisito-tipo-expediente.dto';
import { UpdateRequisitoTipoExpedienteDto } from './dto/update-requisito-tipo-expediente.dto';


@Controller('tipos-expediente/:idTipoExpediente/requisitos')
export class RequisitoTipoExpedienteController {
  constructor(
    private readonly requisitoService: RequisitoTipoExpedienteService,
  ) {}

  @Get(':idTipoDocumento')
  async findOne(
    @Param('idTipoExpediente', ParseIntPipe) idTipoExpediente: number,
    @Param('idTipoDocumento', ParseIntPipe)  idTipoDocumento: number,
  ): Promise<RequisitoTipoExpediente> {
    return this.requisitoService.findOne(idTipoExpediente, idTipoDocumento);
  }


  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('idTipoExpediente', ParseIntPipe) idTipoExpediente: number,
    @Body() dto: CreateRequisitoTipoExpedienteDto,
  ): Promise<RequisitoTipoExpediente> {

    dto.idTipoExpediente = idTipoExpediente;
    return this.requisitoService.create(dto);
  }


  @Patch(':idTipoDocumento')
  async update(
    @Param('idTipoExpediente', ParseIntPipe) idTipoExpediente: number,
    @Param('idTipoDocumento', ParseIntPipe)  idTipoDocumento: number,
    @Body() dto: UpdateRequisitoTipoExpedienteDto,
  ): Promise<RequisitoTipoExpediente> {
    return this.requisitoService.update(idTipoExpediente, idTipoDocumento, dto);
  }

 
  @Delete(':idTipoDocumento')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('idTipoExpediente', ParseIntPipe) idTipoExpediente: number,
    @Param('idTipoDocumento', ParseIntPipe)  idTipoDocumento: number,
  ): Promise<{ mensaje: string }> {
    return this.requisitoService.remove(idTipoExpediente, idTipoDocumento);
  }
}