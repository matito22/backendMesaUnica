import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoTipoExpedienteService } from './requisito-tipo-expediente.service';

describe('RequisitoTipoExpedienteService', () => {
  let service: RequisitoTipoExpedienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisitoTipoExpedienteService],
    }).compile();

    service = module.get<RequisitoTipoExpedienteService>(RequisitoTipoExpedienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
