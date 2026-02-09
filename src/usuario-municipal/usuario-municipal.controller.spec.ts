import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioMunicipalController } from './usuario-municipal.controller';
import { UsuarioMunicipalService } from './usuario-municipal.service';

describe('UsuarioMunicipalController', () => {
  let controller: UsuarioMunicipalController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioMunicipalController],
      providers: [UsuarioMunicipalService],
    }).compile();

    controller = module.get<UsuarioMunicipalController>(UsuarioMunicipalController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
