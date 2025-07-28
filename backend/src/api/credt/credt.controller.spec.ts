import { Test, TestingModule } from '@nestjs/testing';
import { CredtController } from './credt.controller';
import { CredtService } from './credt.service';

describe('CredtController', () => {
  let controller: CredtController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CredtController],
      providers: [CredtService],
    }).compile();

    controller = module.get<CredtController>(CredtController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
