import { Test, TestingModule } from '@nestjs/testing';
import { ExpedienteService } from './expediente.service';

describe('ExpedienteService', () => {
  let service: ExpedienteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpedienteService],
    }).compile();

    service = module.get<ExpedienteService>(ExpedienteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
