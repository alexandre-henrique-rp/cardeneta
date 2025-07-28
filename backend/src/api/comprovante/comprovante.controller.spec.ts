import { Test, TestingModule } from '@nestjs/testing';
import { ComprovanteController } from './comprovante.controller';
import { ComprovanteService } from './comprovante.service';

describe('ComprovanteController', () => {
  let controller: ComprovanteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComprovanteController],
      providers: [ComprovanteService],
    }).compile();

    controller = module.get<ComprovanteController>(ComprovanteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
