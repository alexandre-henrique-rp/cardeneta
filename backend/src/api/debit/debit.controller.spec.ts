import { Test, TestingModule } from '@nestjs/testing';
import { DebitController } from './debit.controller';
import { DebitService } from './debit.service';

describe('DebitController', () => {
  let controller: DebitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebitController],
      providers: [DebitService],
    }).compile();

    controller = module.get<DebitController>(DebitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
