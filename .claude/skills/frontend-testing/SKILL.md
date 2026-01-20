---
name: frontend-testing
description: Test the AI Birdwatcher frontend with Playwright. Use when verifying UI functionality, testing user flows, checking sightings display, or validating bird profile pages. Automatically tests authentication, navigation, image loading, and data display.
allowed-tools: Read, Write, Bash(npm:*), Bash(npx:*), Bash(playwright:*)
---

# Frontend Testing Skill for AI Birdwatcher

## Purpose

Test the Vue 3 frontend (running on http://localhost:5174) to verify:
- Authentication flows (login/register)
- Dashboard statistics and charts
- Sightings list and detail pages
- Bird profiles and visit history
- Video upload and management
- Image loading from `/api/files/`
- Dark mode toggle

## Quick Commands

```bash
# Run Playwright UI mode (interactive testing)
npx playwright test --ui

# Run specific test
npx playwright test tests/sightings.spec.ts

# Run all tests headless
npx playwright test

# Generate test code (record interactions)
npx playwright codegen http://localhost:5174
```

## Test Structure

Tests should be organized in `packages/frontend/tests/e2e/`:

```
tests/e2e/
├── auth.spec.ts           # Login/register flows
├── dashboard.spec.ts      # Dashboard KPIs and charts
├── sightings.spec.ts      # Sightings list and detail
├── birds.spec.ts          # Bird directory and profiles
└── videos.spec.ts         # Video upload and status
```

## Common Test Patterns

### Navigate and verify page loads

```typescript
await page.goto('http://localhost:5174/sightings/36');
await expect(page.locator('h2')).toContainText('Mourning Dove');
```

### Check image loaded

```typescript
const img = page.locator('img[src*="/api/files/"]');
await expect(img).toBeVisible();
```

### Verify no text truncation (ellipses)

```typescript
const featuresText = page.locator('[data-testid="features-observed"]');
await expect(featuresText).not.toContainText('...');
```

### Test authentication

```typescript
await page.goto('http://localhost:5174/auth/login');
await page.fill('[data-testid="email"]', 'test@example.com');
await page.fill('[data-testid="password"]', 'password123');
await page.click('button[type="submit"]');
await expect(page).toHaveURL(/.*dashboard/);
```

## Best Practices

1. **Use data-testid attributes**: Add `data-testid="features-observed"` to important elements
2. **Wait for network**: Use `await page.waitForLoadState('networkidle')` after navigation
3. **Check both light and dark mode**: Test theme persistence
4. **Verify API responses**: Use `page.waitForResponse()` to check backend calls
5. **Clean up auth state**: Start each test with `await page.context().clearCookies()`

## Integration with Backend

Frontend tests require the backend running on http://localhost:3000. Verify:
- Database has test data (sightings, birds, videos)
- Static files accessible at `/api/files/`
- JWT authentication working

## When Claude Uses This Skill

This skill activates when you ask to:
- "Test the sighting detail page"
- "Verify images are loading"
- "Check if text wraps correctly"
- "Test the login flow"
- "Validate the dashboard displays correctly"
