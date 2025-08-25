import { test, expect } from "@playwright/test";

test("landing page can redirect to projects page", async ({ page }) => {
  await page.goto("/");

  const startButtons = page.getByRole("button", { name: "Start EDITing" });
  await expect(startButtons).toHaveCount(2);

  await startButtons.nth(0).click();

  await expect(page).toHaveURL("/projects");
});
