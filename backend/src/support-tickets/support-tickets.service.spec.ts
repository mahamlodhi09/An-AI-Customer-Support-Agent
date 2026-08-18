import { Test, TestingModule } from '@nestjs/testing';
import { SupportTicketsService } from './support-tickets.service';

describe('SupportTicketsService', () => {
  let service: SupportTicketsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupportTicketsService],
    }).compile();

    service = module.get<SupportTicketsService>(SupportTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
