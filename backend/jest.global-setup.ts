import { execSync } from "child_process";

export default async function globalSetup() {
  // Start Dockerized DB
  execSync('docker compose up -d', { stdio: 'inherit' });

   // Wait for DB to be ready and push schema
  for (let i = 0; i < 10; i++) {
    try {
        execSync('npx prisma db push', { stdio: 'inherit' });
        break;
    } catch (err) {
        console.log(`DB not ready yet, retrying... (${i + 1}/10)`);
        await new Promise((r) => setTimeout(r, 5000));
    }
  }
}
