import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should allow user to sign up', async ({ page }) => {
    await page.goto('/register')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('should allow user to log in', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'testpassword123')
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/dashboard')
  })
})
