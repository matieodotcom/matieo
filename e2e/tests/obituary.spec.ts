import { test, expect } from '@playwright/test'

test.describe('Obituaries — public flow', () => {
  test('navigates to obituary list page', async ({ page }) => {
    await page.goto('/obituary')
    await expect(page.getByRole('heading', { name: 'Obituaries' })).toBeVisible()
    await expect(page.getByText('Create and share obituaries to honor your loved ones')).toBeVisible()
  })

  test('shows Create Obituary button', async ({ page }) => {
    await page.goto('/obituary')
    await expect(page.getByRole('button', { name: /Create Obituary/ })).toBeVisible()
  })

  test('redirects unauthenticated user to signin when Create Obituary is clicked', async ({ page }) => {
    await page.goto('/obituary')
    await page.getByRole('button', { name: /Create Obituary/ }).click()
    // Should redirect to signin since not logged in
    await expect(page).toHaveURL(/\/signin/)
  })

  test('shows search bar on obituary list page', async ({ page }) => {
    await page.goto('/obituary')
    await expect(page.getByLabel('Search obituaries')).toBeVisible()
  })

  test('individual obituary 404 shows not found message', async ({ page }) => {
    await page.goto('/obituary/nonexistent-obituary-slug-that-does-not-exist')
    await expect(page.getByText('Obituary not found')).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('Obituaries — dashboard requires auth', () => {
  test('dashboard obituary route redirects to signin when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/obituary')
    // DashboardLayout redirects to /signin when no user
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 })
  })

  test('create obituary route redirects to signin when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/obituary/create')
    await expect(page).toHaveURL(/\/signin/, { timeout: 10_000 })
  })
})
