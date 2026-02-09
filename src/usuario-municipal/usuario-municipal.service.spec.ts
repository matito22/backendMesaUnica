import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioMunicipalService } from './usuario-municipal.service';

describe('UsuarioMunicipalService', () => {
  let service: UsuarioMunicipalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsuarioMunicipalService],
    }).compile();

    service = module.get<UsuarioMunicipalService>(UsuarioMunicipalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
