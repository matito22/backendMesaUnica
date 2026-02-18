import { Test, TestingModule } from '@nestjs/testing';
import { TipoExpedienteService } from './tipo-expediente.service';

describe('TipoExpedienteService', () => {
  let service: TipoExpedienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TipoExpedienteService],
    }).compile();

    service = module.get<TipoExpedienteService>(TipoExpedienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
