import { Test, TestingModule } from '@nestjs/testing';
import { SupportTicketsController } from './support-tickets.controller';

describe('SupportTicketsController', () => {
  let controller: SupportTicketsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SupportTicketsController],
    }).compile();

    controller = module.get<SupportTicketsController>(SupportTicketsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
