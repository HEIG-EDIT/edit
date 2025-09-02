import { TokensService } from '../tokens.service';
import * as crypto from 'crypto';

describe('TokensService', () => {
  let service: TokensService;

  beforeEach(() => {
    service = new TokensService();
  });

  describe('sha256Hex', () => {
    it('should return the correct SHA-256 hex hash', () => {
      const input = 'hello-world';
      const expected = crypto.createHash('sha256').update(input, 'utf8').digest('hex');
      expect(service.sha256Hex(input)).toBe(expected);
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = service.sha256Hex('foo');
      const hash2 = service.sha256Hex('bar');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generate', () => {
    it('should generate a random string of the expected length (hex)', () => {
      const token = service.generate(16); // 16 bytes → 32 hex chars
      expect(typeof token).toBe('string');
      expect(token.length).toBe(32);
    });

    it('should generate different tokens on consecutive calls', () => {
      const token1 = service.generate(8);
      const token2 = service.generate(8);
      expect(token1).not.toBe(token2);
    });
  });

  describe('pair', () => {
    it('should return a token pair with plain, hash, and expiresAt', () => {
      const ttlMs = 60_000; // 1 min
      const pair = service.pair(ttlMs, 16);

      expect(pair).toHaveProperty('plain');
      expect(pair).toHaveProperty('hash');
      expect(pair).toHaveProperty('expiresAt');

      // plain must hash to hash
      const expectedHash = service.sha256Hex(pair.plain);
      expect(pair.hash).toBe(expectedHash);

      // expiresAt must be in the future
      expect(pair.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should respect the TTL (expiresAt is current time + ttlMs)', () => {
      const ttlMs = 5000;
      const before = Date.now();
      const { expiresAt } = service.pair(ttlMs);

      const delta = expiresAt.getTime() - before;
      expect(delta).toBeGreaterThanOrEqual(ttlMs);
      expect(delta).toBeLessThan(ttlMs + 50); // allow small drift
    });
  });
});
