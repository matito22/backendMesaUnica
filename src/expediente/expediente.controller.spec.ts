import { Test, TestingModule } from '@nestjs/testing';
import { ExpedienteController } from './expediente.controller';
import { ExpedienteService } from './expediente.service';

describe('ExpedienteController', () => {
  let controller: ExpedienteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpedienteController],
      providers: [ExpedienteService],
    }).compile();

    controller = module.get<ExpedienteController>(ExpedienteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
