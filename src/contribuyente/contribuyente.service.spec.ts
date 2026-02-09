import { Test, TestingModule } from '@nestjs/testing';
import { ContribuyenteService } from './contribuyente.service';

describe('ContribuyenteService', () => {
  let service: ContribuyenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContribuyenteService],
    }).compile();

    service = module.get<ContribuyenteService>(ContribuyenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
