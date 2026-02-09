import { Test, TestingModule } from '@nestjs/testing';
import { TipoDocumentoController } from './tipo-documento.controller';
import { TipoDocumentoService } from './tipo-documento.service';

describe('TipoDocumentoController', () => {
  let controller: TipoDocumentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoDocumentoController],
      providers: [TipoDocumentoService],
    }).compile();

    controller = module.get<TipoDocumentoController>(TipoDocumentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
