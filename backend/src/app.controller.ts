import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('health')
  getHealth(): {status : string} {
    return this.appService.getHealth();
  }
  @Get('hello/:name')
  getGreetings(@Param('name') name: string): string {
    return this.appService.getGreeting(name);
  }
}
