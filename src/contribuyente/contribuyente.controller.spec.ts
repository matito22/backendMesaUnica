import { Test, TestingModule } from '@nestjs/testing';
import { ContribuyenteController } from './contribuyente.controller';
import { ContribuyenteService } from './contribuyente.service';

describe('ContribuyenteController', () => {
  let controller: ContribuyenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContribuyenteController],
      providers: [ContribuyenteService],
    }).compile();

    controller = module.get<ContribuyenteController>(ContribuyenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
