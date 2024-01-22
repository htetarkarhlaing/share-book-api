import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
    <div style="width: 100vw;height: 100vh;display: flex;justify-content:center;align-items:center;">
      <div style="display: flex;flex-direction:column;justify-content:center;align-items:center;">
        <h1>Welcome to Share Book API service.</h1>
        <a href="/docs" style="font-size: 18px">Go to docs</a>
      </div>
    </div>`;
  }
}
