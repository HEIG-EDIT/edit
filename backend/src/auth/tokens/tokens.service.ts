import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface TokenPair {
  plain: string; // send to client (or embed in link)
  hash: string; // store in DB
  expiresAt: Date; // TTL applied
}

@Injectable()
export class TokensService {
  /**
   * SHA-256 hex hash (safe for DB lookups).
   */
  sha256Hex(input: string): string {
    return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
  }

  /**
   * Generate a random token (hex or base64url). Default: 32 bytes hex.
   */
  generate(bytes = 32): string {
    // Node's Buffer supports 'base64url' from v20; if older, swap to 'base64' and sanitize.
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Generate a pair ready for persistence & delivery:
   * - `plain` is what you return to the client (or put in an email link)
   * - `hash` is what you store in DB
   * - `expiresAt` applies the TTL in ms
   */
  pair(ttlMs: number, bytes = 32): TokenPair {
    const plain = this.generate(bytes);
    const hash = this.sha256Hex(plain);
    const expiresAt = new Date(Date.now() + ttlMs);
    return { plain, hash, expiresAt };
  }
}
