import * as fs from 'fs';

export default {
  privateKey: fs.readFileSync('keys/private.pem'),
  publicKey: fs.readFileSync('keys/public.pem'),
};
