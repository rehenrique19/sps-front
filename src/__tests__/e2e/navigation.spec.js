import { test, expect } from '@playwright/test';

test.describe('Navigation and Routing', () => {
  test('should protect routes when not authenticated', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL('/signin');
    
    await page.goto('/users/new');
    await expect(page).toHaveURL('/signin');
  });

  test('should redirect authenticated user from signin to users', async ({ page }) => {
    // Login first
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/users');
    
    // Try to go back to signin
    await page.goto('/signin');
    await expect(page).toHaveURL('/users');
  });

  test('should handle direct URL access correctly', async ({ page }) => {
    // Direct access to root should redirect to signin
    await page.goto('/');
    await expect(page).toHaveURL('/signin');
    
    // Login
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    
    // Now direct access to root should redirect to users
    await page.goto('/');
    await expect(page).toHaveURL('/users');
  });

  test('should maintain authentication state across navigation', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    
    // Navigate to different routes
    await page.goto('/users/new');
    await expect(page.locator('h2')).toContainText('Novo Usuário');
    
    await page.goto('/users');
    await expect(page.locator('h1')).toContainText('Usuários');
    
    // Should still be authenticated
    await expect(page.locator('text=Sair')).toBeVisible();
  });

  test('should handle browser back/forward buttons', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    
    // Navigate to create user
    await page.click('text=Novo Usuário');
    await expect(page).toHaveURL('/users/new');
    
    // Go back
    await page.goBack();
    await expect(page).toHaveURL('/users');
    
    // Go forward
    await page.goForward();
    await expect(page).toHaveURL('/users/new');
  });

  test('should clear authentication on logout and protect routes', async ({ page }) => {
    // Login
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    
    // Logout
    await page.click('text=Sair');
    await expect(page).toHaveURL('/signin');
    
    // Try to access protected route
    await page.goto('/users');
    await expect(page).toHaveURL('/signin');
  });
});