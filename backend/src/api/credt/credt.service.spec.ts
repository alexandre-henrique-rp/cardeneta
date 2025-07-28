import { Test, TestingModule } from '@nestjs/testing';
import { CredtService } from './credt.service';

describe('CredtService', () => {
  let service: CredtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CredtService],
    }).compile();

    service = module.get<CredtService>(CredtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
