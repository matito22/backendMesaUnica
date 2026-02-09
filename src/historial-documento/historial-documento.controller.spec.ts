import { Test, TestingModule } from '@nestjs/testing';
import { HistorialDocumentoController } from './historial-documento.controller';
import { HistorialDocumentoService } from './historial-documento.service';

describe('HistorialDocumentoController', () => {
  let controller: HistorialDocumentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistorialDocumentoController],
      providers: [HistorialDocumentoService],
    }).compile();

    controller = module.get<HistorialDocumentoController>(HistorialDocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
