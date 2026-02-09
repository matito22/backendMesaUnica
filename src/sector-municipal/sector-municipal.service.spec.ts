import { Test, TestingModule } from '@nestjs/testing';
import { SectorMunicipalService } from './sector-municipal.service';

describe('SectorMunicipalService', () => {
  let service: SectorMunicipalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SectorMunicipalService],
    }).compile();

    service = module.get<SectorMunicipalService>(SectorMunicipalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
