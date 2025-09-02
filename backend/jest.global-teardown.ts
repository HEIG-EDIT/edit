import { execSync } from "child_process";

export default async function globalTeardown() {
  // Stopping test database
  execSync("docker compose down -v", { stdio: "inherit" });
}
