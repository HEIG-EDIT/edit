import * as fs from 'fs';
import * as path from 'path';
import type { Algorithm } from 'jsonwebtoken';

export default () => ({
  auth: {
    privateKey: fs.readFileSync(path.join(process.cwd(), 'keys/private.pem'), 'utf8'),
    publicKey: fs.readFileSync(path.join(process.cwd(), 'keys/public.pem'), 'utf8'),
    algorithm: 'RS256' as Algorithm,
    accessTokenExpiry: '15m',
    refreshTokenExpiry: '30d',
  },
});
