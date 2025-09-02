import * as fs from 'fs';
import * as path from 'path';
import type { Algorithm } from 'jsonwebtoken';

/**
 * Safely reads a file and returns its content as a string.
 * If the file does not exist or cannot be read, it returns undefined.
 * @param filePath - The path to the file to read.
 * @returns The file content as a string, or undefined if an error occurs.
 */
function safeRead(filePath: string): string | undefined {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return undefined;
  }
}

/**
 * Retrieves a JWT key from environment variables or a file.
 * It first checks for a plain PEM in the specified env variable,
 * then checks for a base64-encoded PEM in another env variable,
 * and finally falls back to reading from a file.
 * @param envKey - The environment variable name for the plain PEM.
 * @param envKeyB64 - The environment variable name for the base64-encoded PEM.
 * @param relativeFile - The relative file path to read the PEM from if not found in env.
 * @returns The JWT key as a string.
 * @throws An error if the key cannot be found in any of the sources.
 */
function fromEnvOrFile(
  envKey: string,
  envKeyB64: string,
  relativeFile: string,
): string {
  // 1) Plain PEM in env
  const pem = process.env[envKey];
  if (pem && pem.includes('BEGIN')) return pem;

  // 2) Base64 in env
  const b64 = process.env[envKeyB64];
  if (b64) {
    try {
      const decoded = Buffer.from(b64, 'base64').toString('utf8');
      if (decoded.includes('BEGIN')) return decoded;
    } catch {
      // ignore
    }
  }

  // 3) File path relative to this file (works in src and dist)
  // auth.config.ts is under src/config (or dist/src/config)
  const fileFromHere = path.resolve(__dirname, '../../', relativeFile);
  const content = safeRead(fileFromHere);
  if (content && content.includes('BEGIN')) return content;

  // 4) Fallback to CWD/keys if someone runs from repo root
  const fromCwd = safeRead(path.resolve(process.cwd(), relativeFile));
  if (fromCwd && fromCwd.includes('BEGIN')) return fromCwd;

  throw new Error(
    `JWT key not found for ${relativeFile}. Provide ${envKey} or ${envKeyB64}, or ensure ${relativeFile} exists.`,
  );
}

export default () => ({
  auth: {
    privateKey: fromEnvOrFile(
      'JWT_PRIVATE_KEY',
      'JWT_PRIVATE_KEY_B64',
      'keys/private.pem',
    ),
    publicKey: fromEnvOrFile(
      'JWT_PUBLIC_KEY',
      'JWT_PUBLIC_KEY_B64',
      'keys/public.pem',
    ),
    algorithm: 'RS256' as Algorithm,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '30d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
  },
  microsoft: {
    clientId: process.env.MICROSOFT_CLIENT_ID,
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
    callbackUrl: process.env.MICROSOFT_CALLBACK_URL,
  },
});
