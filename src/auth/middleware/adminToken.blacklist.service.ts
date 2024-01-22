import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminTokenBlacklistService {
  private readonly blacklist: Set<string> = new Set();

  addToBlacklist(token: string): void {
    this.blacklist.add(token);
  }

  isTokenBlacklisted(token: string): boolean {
    return this.blacklist.has(token);
  }
}
