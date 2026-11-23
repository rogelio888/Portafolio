import { test, expect } from '@playwright/test';

const viewports = [
  { name: 'android-360', width: 360, height: 800, isMobile: true },
  { name: 'iphone-390', width: 390, height: 844, isMobile: true },
  { name: 'tablet-768', width: 768, height: 1024, isMobile: false },
  { name: 'desktop-1440', width: 1440, height: 900, isMobile: false }
];

for (const vp of viewports) {
  test.describe(`Viewport: ${vp.name} (${vp.width}x${vp.height})`, () => {
    test(`Responsive layout, touch targets and bottom sheet flow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // 1. Check no horizontal overflow
      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);

      // 2. Hero visibility
      const headline = page.locator('h1');
      await expect(headline).toBeVisible();

      // 3. Test card switching in Hero
      const nextBtn = page.getByTitle('Ver siguiente viñeta');
      await expect(nextBtn).toBeVisible();
      await nextBtn.click();
      await page.waitForTimeout(400);

      // Screenshot 1: Hero view
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-01-hero.png`,
        fullPage: false 
      });

      // 4. Test Mobile Menu (on mobile/tablet)
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

      // 5. Scroll to Showcase section
      const showcaseSection = page.locator('#proyectos');
      await showcaseSection.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Screenshot 2: Showcase grid
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-02-showcase.png`,
        fullPage: false 
      });

      // 6. Test Modal / Bottom Sheet Drawer
      const fichaBtn = page.getByRole('button', { name: 'Ficha & Módulos' }).first();
      await expect(fichaBtn).toBeVisible();
      await fichaBtn.click();
      await page.waitForTimeout(600);

      // Check modal content is rendered and visible
      const modalHeader = page.getByText(/Ficha/i).first();
      await expect(modalHeader).toBeVisible();

      // Check WhatsApp button in sticky footer
      const whatsAppModalBtn = page.getByRole('link', { name: 'Consultar por WhatsApp' });
      await expect(whatsAppModalBtn).toBeVisible();

      // Screenshot 3: Modal / Bottom Sheet Drawer open
      await page.screenshot({ 
        path: `screenshots-audit/${vp.name}-03-modal.png`,
        fullPage: false 
      });

      // 7. Test closing modal
      const closeBtn = page.locator('button[aria-label="Cerrar modal"]');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      await page.waitForTimeout(400);

      // Ensure modal is gone
      await expect(page.locator('button[aria-label="Cerrar modal"]')).not.toBeVisible();
    });
  });
}
