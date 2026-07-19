import { test, expect } from '@playwright/test';

test('Homepage Visual Audit', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Wait for the page to load completely and animations to settle
  await page.waitForTimeout(2000); 
  await page.screenshot({ path: 'playwright-report/homepage-audit.png', fullPage: true });
});
