import { test, expect } from '@playwright/test';

test.describe('Sighting Detail - Bird 36', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('http://localhost:5174/auth/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should display features observed without ellipses', async ({ page }) => {
    // Navigate to sighting 36
    await page.goto('http://localhost:5174/sightings/36');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Wait for the AI analysis section to be visible
    const aiAnalysisCard = page.locator('text=AI Analysis').locator('..');
    await expect(aiAnalysisCard).toBeVisible();

    // Find the features observed text
    const featuresLabel = page.locator('text=Features observed');
    await expect(featuresLabel).toBeVisible();

    // Get the features text element - it should be in a div with text-body-2 class
    const featuresText = page.locator('.text-body-2.text-medium-emphasis').first();
    await expect(featuresText).toBeVisible();

    // Get the actual text content
    const fullText = await featuresText.textContent();
    console.log('Features text:', fullText);

    // Expected full text from database
    const expectedText = 'Light brown body with long pointed tail, subtle grayish tones, and black spots on wings.';

    // Verify the full text is displayed (not truncated)
    expect(fullText?.trim()).toBe(expectedText);

    // Verify no ellipsis character
    expect(fullText).not.toContain('...');
    expect(fullText).not.toContain('…');

    // Take a screenshot for visual verification
    await page.screenshot({ path: 'sighting-36-features.png', fullPage: true });
  });

  test('should show complete text without CSS truncation', async ({ page }) => {
    await page.goto('http://localhost:5174/sightings/36');
    await page.waitForLoadState('networkidle');

    // Check the computed style of the features text
    const featuresText = page.locator('.text-body-2.text-medium-emphasis').first();

    // Get computed styles
    const whiteSpace = await featuresText.evaluate((el) => {
      return window.getComputedStyle(el).whiteSpace;
    });

    const textOverflow = await featuresText.evaluate((el) => {
      return window.getComputedStyle(el).textOverflow;
    });

    console.log('white-space:', whiteSpace);
    console.log('text-overflow:', textOverflow);

    // Verify white-space is 'normal' (allows wrapping)
    expect(whiteSpace).toBe('normal');

    // Verify text-overflow is NOT 'ellipsis'
    expect(textOverflow).not.toBe('ellipsis');
  });
});
