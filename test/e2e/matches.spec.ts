import { test, expect } from "@playwright/test"

test.describe("Matches Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display the main heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /mérkőzés szűrő és statisztikák/i })).toBeVisible()
  })

  test("should have filter section", async ({ page }) => {
    await expect(page.getByText("Szűrők")).toBeVisible()
    await expect(page.getByRole("button", { name: /szűrés/i })).toBeVisible()
    await expect(page.getByRole("button", { name: /visszaállítás/i })).toBeVisible()
  })

  test("should have statistics section", async ({ page }) => {
    await expect(page.getByText("Statisztikák")).toBeVisible()
  })

  test("should have results section", async ({ page }) => {
    await expect(page.getByText("Listázott eredmények")).toBeVisible()
  })

  test("should apply filters", async ({ page }) => {
    // Click apply filters button
    await page.getByRole("button", { name: /szűrés/i }).click()

    // Should show loading state or updated results
    await expect(page.locator("[data-testid=loading]").or(page.getByText("Mérkőzések:"))).toBeVisible()
  })

  test("should reset filters", async ({ page }) => {
    // Click reset filters button
    await page.getByRole("button", { name: /visszaállítás/i }).click()

    // Should show success message or reset state
    await expect(page.locator("[data-testid=toast]").or(page.getByText("Szűrők visszaállítva"))).toBeVisible()
  })

  test("should export CSV", async ({ page }) => {
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent("download")

    // Click export button
    await page.getByRole("button", { name: /csv export/i }).click()

    // Wait for download
    const download = await downloadPromise

    // Verify download
    expect(download.suggestedFilename()).toMatch(/winmix-matches-.*\.csv/)
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    // Check that mobile layout is working
    await expect(page.getByRole("heading", { name: /mérkőzés szűrő és statisztikák/i })).toBeVisible()
    await expect(page.getByText("Szűrők")).toBeVisible()
  })

  test("should handle keyboard navigation", async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")
    await page.keyboard.press("Tab")

    // Should focus on apply button
    await expect(page.getByRole("button", { name: /szűrés/i })).toBeFocused()

    // Press Enter to activate
    await page.keyboard.press("Enter")

    // Should trigger filter application
    await expect(page.locator("[data-testid=loading]").or(page.getByText("Mérkőzések:"))).toBeVisible()
  })
})
