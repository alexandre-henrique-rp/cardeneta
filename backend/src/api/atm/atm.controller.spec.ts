import { Test, TestingModule } from '@nestjs/testing';
import { AtmController } from './atm.controller';
import { AtmService } from './atm.service';

describe('AtmController', () => {
  let controller: AtmController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AtmController],
      providers: [AtmService],
    }).compile();

    controller = module.get<AtmController>(AtmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
