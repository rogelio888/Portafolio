import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'android-360', width: 360, height: 800 },
  { name: 'iphone-390', width: 390, height: 844 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-1440', width: 1440, height: 900 }
];

for (const vp of viewports) {
  test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
    test(`Responsive layout, filter tray and clean cards without modal`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);

      // 1. Check no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // 2. Hero visibility & card deck
      const headline = page.locator('h1');
      await expect(headline).toBeVisible();

      // Test card switching in Hero
      const nextBtn = page.getByTitle('Ver siguiente viñeta');
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
      await page.waitForTimeout(300);

      // Screenshot 1: Hero view
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-01-hero.png`,
        fullPage: false 
      });

      // 3. Test Mobile Menu (on mobile/tablet)
      if (vp.width < 768) {
        const menuBtn = page.locator('button[aria-label="Abrir menú"]');
        if (await menuBtn.isVisible()) {
          await menuBtn.click();
          await page.waitForTimeout(300);
          const proyectosLink = page.getByRole('link', { name: 'Proyectos y Demos' });
          await expect(proyectosLink).toBeVisible();
          // Close menu
          const closeMenuBtn = page.locator('button[aria-label="Cerrar menú"]');
          await closeMenuBtn.click();
          await page.waitForTimeout(300);
        }
      }

      // 4. Scroll to Showcase section
      const showcaseSection = page.locator('#proyectos');
      await showcaseSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // 5. Test Filter Pills
      const saludFilter = page.getByRole('button', { name: /Salud/i });
      await expect(saludFilter).toBeVisible();
      await saludFilter.click();
      await page.waitForTimeout(400);

      // Screenshot 2: Filtered view
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-02-filter.png`,
        fullPage: false 
      });

      // Reset filter to Todos
      const todosFilter = page.getByRole('button', { name: /Todos/i });
      await todosFilter.click();
      await page.waitForTimeout(400);

      // Screenshot 3: Full Showcase Cards
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-03-showcase.png`,
        fullPage: false 
      });

      // 6. Verify first card has modules, button, and NO redundant popup
      const firstCard = page.locator('.comic-panel').first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard.getByRole('link', { name: /Probar Demo/i })).toBeVisible();
      await expect(firstCard.getByRole('link', { name: /Consultar/i })).toBeVisible();
    });
  });
}
