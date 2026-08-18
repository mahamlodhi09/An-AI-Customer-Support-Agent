import { Test, TestingModule } from '@nestjs/testing';
import { RefundsService } from './refunds.service';

describe('RefundsService', () => {
  let service: RefundsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RefundsService],
    }).compile();

    service = module.get<RefundsService>(RefundsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
