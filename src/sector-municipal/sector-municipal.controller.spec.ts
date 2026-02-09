import { Test, TestingModule } from '@nestjs/testing';
import { SectorMunicipalController } from './sector-municipal.controller';
import { SectorMunicipalService } from './sector-municipal.service';

describe('SectorMunicipalController', () => {
  let controller: SectorMunicipalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SectorMunicipalController],
      providers: [SectorMunicipalService],
    }).compile();

    controller = module.get<SectorMunicipalController>(SectorMunicipalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
