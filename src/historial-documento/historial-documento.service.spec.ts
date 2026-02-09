import { Test, TestingModule } from '@nestjs/testing';
import { HistorialDocumentoService } from './historial-documento.service';

describe('HistorialDocumentoService', () => {
  let service: HistorialDocumentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HistorialDocumentoService],
    }).compile();

    service = module.get<HistorialDocumentoService>(HistorialDocumentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
