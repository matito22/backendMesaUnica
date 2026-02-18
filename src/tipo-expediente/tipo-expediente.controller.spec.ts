import { Test, TestingModule } from '@nestjs/testing';
import { TipoExpedienteController } from './tipo-expediente.controller';
import { TipoExpedienteService } from './tipo-expediente.service';

describe('TipoExpedienteController', () => {
  let controller: TipoExpedienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoExpedienteController],
      providers: [TipoExpedienteService],
    }).compile();

    controller = module.get<TipoExpedienteController>(TipoExpedienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
