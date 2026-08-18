import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getHealth(): {status : string} {
    return {status: 'OK'};
  }
 getGreeting(name: string): string {
  return `Hello, ${name}! Welcome to the store.`;
}
}
