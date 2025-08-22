import { test, expect } from '@playwright/test';

test.describe('Users Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/signin');
    await page.fill('input[name="email"]', 'admin@spsgroup.com.br');
    await page.fill('input[name="password"]', '1234');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/users');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Usuários');
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th')).toContainText(['Nome', 'Email', 'Tipo', 'Ações']);
  });

  test('should navigate to create user form', async ({ page }) => {
    await page.click('text=Novo Usuário');
    await expect(page).toHaveURL('/users/new');
    await expect(page.locator('h2')).toContainText('Novo Usuário');
  });

  test('should create new user successfully', async ({ page }) => {
    await page.click('text=Novo Usuário');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.selectOption('select[name="type"]', 'user');
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/users');
    await expect(page.locator('text=Test User')).toBeVisible();
  });

  test('should show validation errors for empty required fields', async ({ page }) => {
    await page.click('text=Novo Usuário');
    await page.click('button[type="submit"]');
    
    // HTML5 validation should prevent submission
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('required');
  });

  test('should edit existing user', async ({ page }) => {
    // Assuming admin user exists in the list
    const editLinks = page.locator('text=Editar');
    if (await editLinks.count() > 0) {
      await editLinks.first().click();
      
      await expect(page.locator('h2')).toContainText('Editar Usuário');
      
      await page.fill('input[name="name"]', 'Updated Admin');
      await page.click('button[type="submit"]');
      
      await expect(page).toHaveURL('/users');
    }
  });

  test('should delete user with confirmation', async ({ page }) => {
    // First create a user to delete
    await page.click('text=Novo Usuário');
    await page.fill('input[name="name"]', 'User to Delete');
    await page.fill('input[name="email"]', 'delete@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/users');
    
    // Set up dialog handler
    page.on('dialog', dialog => dialog.accept());
    
    // Delete the user
    const deleteButtons = page.locator('text=Excluir');
    if (await deleteButtons.count() > 0) {
      await deleteButtons.last().click();
      
      // User should be removed from list
      await expect(page.locator('text=User to Delete')).not.toBeVisible();
    }
  });

  test('should cancel user deletion', async ({ page }) => {
    // Set up dialog handler to cancel
    page.on('dialog', dialog => dialog.dismiss());
    
    const deleteButtons = page.locator('text=Excluir');
    if (await deleteButtons.count() > 0) {
      const userRow = deleteButtons.first().locator('..').locator('..');
      const userName = await userRow.locator('td').first().textContent();
      
      await deleteButtons.first().click();
      
      // User should still be in the list
      await expect(page.locator(`text=${userName}`)).toBeVisible();
    }
  });

  test('should navigate back to users list from form', async ({ page }) => {
    await page.click('text=Novo Usuário');
    await page.click('text=Cancelar');
    
    await expect(page).toHaveURL('/users');
    await expect(page.locator('h1')).toContainText('Usuários');
  });

  test('should display user information correctly', async ({ page }) => {
    // Check if admin user is displayed
    await expect(page.locator('text=admin@spsgroup.com.br')).toBeVisible();
    
    // Check table structure
    const rows = page.locator('tbody tr');
    if (await rows.count() > 0) {
      const firstRow = rows.first();
      await expect(firstRow.locator('td')).toHaveCount(4); // Name, Email, Type, Actions
    }
  });
});