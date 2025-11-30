import { test, expect } from '@playwright/test';

test.describe('Blog Application E2E', () => {
  test('Main page loads and displays title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: 'Blogs', exact: true })).toBeVisible();
  });

  test('Navigation to Login page works', async ({ page }) => {
    await page.goto('/');
    
    await page.click('text=Login');
    
    await expect(page).toHaveURL(/.*\/login/);
    
  });
});
