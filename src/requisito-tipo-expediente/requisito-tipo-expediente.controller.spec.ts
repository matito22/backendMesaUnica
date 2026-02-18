import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoTipoExpedienteController } from './requisito-tipo-expediente.controller';
import { RequisitoTipoExpedienteService } from './requisito-tipo-expediente.service';

describe('RequisitoTipoExpedienteController', () => {
  let controller: RequisitoTipoExpedienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisitoTipoExpedienteController],
      providers: [RequisitoTipoExpedienteService],
    }).compile();

    controller = module.get<RequisitoTipoExpedienteController>(RequisitoTipoExpedienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
