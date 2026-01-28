import { test, expect } from '@playwright/test';

test.describe('Birds Directory', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5174/auth/login');
    await page.fill('input[type="text"]', 'admin');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });
  });

  test('should display species entries with bird data', async ({ page }) => {
    // Navigate to birds directory
    await page.goto('http://localhost:5174/birds');
    await page.waitForLoadState('networkidle');

    // Check page title is present
    await expect(page.locator('h1')).toContainText('Birds Directory');

    // Check that species count is shown
    const subtitle = page.locator('.text-subtitle-1');
    await expect(subtitle).toBeVisible();

    // Wait for species cards to load
    await page.waitForSelector('.species-card, .v-card', { timeout: 10000 });

    // Get all species cards
    const speciesCards = page.locator('.species-card, .v-card').filter({ hasText: /.+/ });
    const cardCount = await speciesCards.count();

    console.log(`Found ${cardCount} species cards`);

    // Should have at least 1 species card
    expect(cardCount).toBeGreaterThan(0);

    // Check first card has expected elements
    const firstCard = speciesCards.first();

    // Should have bird name
    const birdName = firstCard.locator('.bird-name, h3');
    await expect(birdName).toBeVisible();

    // Should have species name (italic)
    const speciesName = firstCard.locator('.bird-species, p');
    await expect(speciesName).toBeVisible();

    // Should have visit count badge
    const visitsBadge = firstCard.locator('.visits-chip, .visits-badge');
    await expect(visitsBadge).toBeVisible();

    // Take a screenshot for verification
    await page.screenshot({ path: 'test-results/birds-directory.png', fullPage: true });

    console.log('Birds Directory test passed - species entries are displayed');
  });
});
