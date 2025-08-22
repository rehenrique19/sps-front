import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should redirect to signin when not authenticated', async ({ page }) => {
    await expect(page).toHaveURL('/signin');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/users');
    await expect(page.locator('h1')).toContainText('Usuários');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', 'wrong-password');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Email é obrigatório')).toBeVisible();
    await expect(page.locator('text=Senha é obrigatória')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/users');

    // Logout
    await page.click('text=Sair');
    await expect(page).toHaveURL('/signin');
  });

  test('should maintain session after page refresh', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/users');

    // Refresh page
    await page.reload();
    await expect(page).toHaveURL('/users');
    await expect(page.locator('h1')).toContainText('Usuários');
  });
});