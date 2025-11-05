/**
 * E2E Test: Complete Chunk Linking Workflow
 * 
 * Tests the full end-to-end workflow of:
 * 1. Navigate to conversations dashboard
 * 2. Click "Link to Chunk" on a conversation
 * 3. Search for chunks in ChunkSelector
 * 4. Select a chunk
 * 5. Verify conversation shows linked chunk
 * 6. Generate conversation with chunk context
 * 7. Verify quality score includes dimension confidence
 * 8. Unlink chunk and verify removal
 */

import { test, expect } from '@playwright/test';

// Note: This test requires Playwright or similar E2E testing framework
// to be configured. For demonstration purposes, we'll structure it
// as if Playwright is available.

test.describe('Chunk Linking Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Assume user is already authenticated or handle auth here
    // await page.goto('http://localhost:3000/signin');
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');
  });

  test('Complete chunk linking workflow', async ({ page }) => {
    // Step 1: Navigate to conversations dashboard
    await page.goto('http://localhost:3000/dashboard');
    await expect(page.locator('h1')).toContainText(/conversations/i);
    
    // Wait for conversations to load
    await page.waitForSelector('[data-testid="conversation-list"]', { timeout: 10000 });
    
    // Step 2: Click "Link to Chunk" on a conversation
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    
    const linkButton = firstConversation.locator('[data-testid="link-chunk-button"]');
    await expect(linkButton).toBeVisible();
    await linkButton.click();
    
    // Step 3: Search for chunks in ChunkSelector
    const chunkSelectorModal = page.locator('[data-testid="chunk-selector-modal"]');
    await expect(chunkSelectorModal).toBeVisible();
    
    const searchInput = chunkSelectorModal.locator('input[placeholder*="Search chunks"]');
    await expect(searchInput).toBeVisible();
    
    // Search for a specific chunk
    await searchInput.fill('API documentation');
    
    // Wait for search results (debounced)
    await page.waitForTimeout(400);
    
    // Verify search results appear
    const searchResults = page.locator('[data-testid^="chunk-card"]');
    await expect(searchResults.first()).toBeVisible();
    const resultCount = await searchResults.count();
    expect(resultCount).toBeGreaterThan(0);
    
    // Step 4: Select a chunk
    const firstChunk = searchResults.first();
    await firstChunk.click();
    
    // Detail panel should open
    const detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await expect(detailPanel).toBeVisible();
    
    // Verify chunk details
    await expect(detailPanel.locator('h2')).toBeVisible();
    await expect(detailPanel.locator('text=/quality score/i')).toBeVisible();
    
    // Click "Select This Chunk" button
    const selectButton = detailPanel.locator('button:has-text("Select This Chunk")');
    await selectButton.click();
    
    // Modal should close
    await expect(chunkSelectorModal).not.toBeVisible();
    
    // Step 5: Verify conversation shows linked chunk
    await page.waitForSelector('[data-testid="linked-chunk-indicator"]', { timeout: 5000 });
    const linkedChunkIndicator = page.locator('[data-testid="linked-chunk-indicator"]');
    await expect(linkedChunkIndicator).toBeVisible();
    await expect(linkedChunkIndicator).toContainText(/linked/i);
    
    // Verify chunk title is displayed
    const linkedChunkTitle = page.locator('[data-testid="linked-chunk-title"]');
    await expect(linkedChunkTitle).toBeVisible();
    
    // Step 6: Generate conversation with chunk context
    const generateButton = page.locator('[data-testid="generate-conversation-button"]');
    await expect(generateButton).toBeVisible();
    await generateButton.click();
    
    // Wait for generation to complete
    await page.waitForSelector('[data-testid="generation-complete-indicator"]', { 
      timeout: 30000 
    });
    
    // Verify generated conversation appears
    const generatedConversation = page.locator('[data-testid="conversation-content"]');
    await expect(generatedConversation).toBeVisible();
    await expect(generatedConversation).not.toBeEmpty();
    
    // Step 7: Verify quality score includes dimension confidence
    const qualityScoreSection = page.locator('[data-testid="quality-score-section"]');
    await expect(qualityScoreSection).toBeVisible();
    
    const dimensionConfidence = page.locator('[data-testid="dimension-confidence"]');
    await expect(dimensionConfidence).toBeVisible();
    await expect(dimensionConfidence).toContainText(/confidence/i);
    
    // Verify confidence score is displayed (should be a percentage or number)
    const confidenceValue = await dimensionConfidence.locator('[data-testid="confidence-value"]').textContent();
    expect(confidenceValue).toMatch(/\d+/);
    
    // Step 8: Unlink chunk and verify removal
    const unlinkButton = page.locator('[data-testid="unlink-chunk-button"]');
    await expect(unlinkButton).toBeVisible();
    await unlinkButton.click();
    
    // Confirm unlink in dialog if present
    const confirmButton = page.locator('button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Wait for unlink to complete
    await page.waitForTimeout(1000);
    
    // Verify linked chunk indicator is removed
    await expect(linkedChunkIndicator).not.toBeVisible();
    
    // Verify link button is available again
    await expect(linkButton).toBeVisible();
  });

  test('Chunk filtering works correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Open chunk selector
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    await expect(chunkSelector).toBeVisible();
    
    // Open filters
    const filtersButton = chunkSelector.locator('button:has-text("Filters")');
    await filtersButton.click();
    
    // Set quality filter to high
    const highQualityButton = chunkSelector.locator('button:has-text("High (≥8)")');
    await highQualityButton.click();
    
    // Wait for results to update
    await page.waitForTimeout(500);
    
    // Verify filtered results
    const chunks = page.locator('[data-testid^="chunk-card"]');
    const count = await chunks.count();
    
    // All visible chunks should have quality ≥ 8
    for (let i = 0; i < count; i++) {
      const chunk = chunks.nth(i);
      const qualityBadge = chunk.locator('[data-testid="quality-badge"]');
      const qualityText = await qualityBadge.textContent();
      const qualityValue = parseFloat(qualityText?.match(/[\d.]+/)?.[0] || '0');
      expect(qualityValue).toBeGreaterThanOrEqual(8);
    }
    
    // Clear filters
    const clearButton = chunkSelector.locator('button:has-text("Clear All")');
    await clearButton.click();
    
    // Verify more results appear
    await page.waitForTimeout(500);
    const newCount = await chunks.count();
    expect(newCount).toBeGreaterThanOrEqual(count);
  });

  test('Chunk detail panel displays all information', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Open chunk selector
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    await expect(chunkSelector).toBeVisible();
    
    // Click on first chunk
    const firstChunk = page.locator('[data-testid^="chunk-card"]').first();
    await firstChunk.click();
    
    // Verify detail panel
    const detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await expect(detailPanel).toBeVisible();
    
    // Check all required sections
    await expect(detailPanel.locator('text=/document/i')).toBeVisible();
    await expect(detailPanel.locator('text=/page/i')).toBeVisible();
    await expect(detailPanel.locator('text=/content/i')).toBeVisible();
    await expect(detailPanel.locator('text=/quality/i')).toBeVisible();
    
    // Check for semantic dimensions
    const dimensionsSection = detailPanel.locator('text=/semantic dimensions/i');
    if (await dimensionsSection.isVisible()) {
      // Verify progress bars are present
      const progressBars = detailPanel.locator('[role="progressbar"]');
      expect(await progressBars.count()).toBeGreaterThan(0);
    }
    
    // Check for semantic categories
    const categoriesSection = detailPanel.locator('text=/semantic categories/i');
    if (await categoriesSection.isVisible()) {
      // Verify badges are present
      const badges = detailPanel.locator('[data-testid^="badge"]');
      expect(await badges.count()).toBeGreaterThan(0);
    }
  });

  test('Error handling for failed chunk linking', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/conversations/*/link-chunk', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });
    
    await page.goto('http://localhost:3000/dashboard');
    
    // Attempt to link chunk
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    const firstChunk = page.locator('[data-testid^="chunk-card"]').first();
    await firstChunk.click();
    
    const detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await detailPanel.locator('button:has-text("Select This Chunk")').click();
    
    // Verify error message appears
    const errorToast = page.locator('[data-testid="error-toast"]');
    await expect(errorToast).toBeVisible();
    await expect(errorToast).toContainText(/error/i);
  });

  test('Orphaned conversations query works', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Navigate to orphaned conversations view
    const orphanedButton = page.locator('[data-testid="orphaned-conversations-button"]');
    if (await orphanedButton.isVisible()) {
      await orphanedButton.click();
      
      // Wait for orphaned conversations to load
      await page.waitForSelector('[data-testid="orphaned-conversations-list"]');
      
      const orphanedList = page.locator('[data-testid="orphaned-conversations-list"]');
      await expect(orphanedList).toBeVisible();
      
      // Verify conversations are displayed
      const orphanedItems = page.locator('[data-testid^="orphaned-conversation"]');
      const count = await orphanedItems.count();
      
      // If there are orphaned conversations, verify they can be linked
      if (count > 0) {
        const firstOrphaned = orphanedItems.first();
        const linkButton = firstOrphaned.locator('[data-testid="link-chunk-button"]');
        await expect(linkButton).toBeVisible();
      }
    }
  });

  test('Keyboard navigation works in chunk selector', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    // Open chunk selector
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    await expect(chunkSelector).toBeVisible();
    
    // Focus on search input
    const searchInput = chunkSelector.locator('input[placeholder*="Search chunks"]');
    await searchInput.focus();
    
    // Press down arrow to navigate to first result
    await page.keyboard.press('ArrowDown');
    
    // First chunk should be focused
    const firstChunk = page.locator('[data-testid^="chunk-card"]').first();
    await expect(firstChunk).toBeFocused();
    
    // Press down arrow again
    await page.keyboard.press('ArrowDown');
    
    // Second chunk should be focused
    const secondChunk = page.locator('[data-testid^="chunk-card"]').nth(1);
    await expect(secondChunk).toBeFocused();
    
    // Press Enter to select
    await page.keyboard.press('Enter');
    
    // Detail panel should open
    const detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await expect(detailPanel).toBeVisible();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(detailPanel).not.toBeVisible();
  });

  test('Multiple conversations can be linked to same chunk', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const conversations = page.locator('[data-testid="conversation-item"]');
    const count = await conversations.count();
    
    if (count < 2) {
      test.skip();
      return;
    }
    
    // Link first conversation
    await conversations.first().hover();
    await conversations.first().locator('[data-testid="link-chunk-button"]').click();
    
    let chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    const firstChunk = page.locator('[data-testid^="chunk-card"]').first();
    await firstChunk.click();
    
    let detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await detailPanel.locator('button:has-text("Select This Chunk")').click();
    
    await page.waitForTimeout(1000);
    
    // Link second conversation to same chunk
    await conversations.nth(1).hover();
    await conversations.nth(1).locator('[data-testid="link-chunk-button"]').click();
    
    chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    // Use same chunk (first one)
    await page.locator('[data-testid^="chunk-card"]').first().click();
    
    detailPanel = page.locator('[data-testid="chunk-detail-panel"]');
    await detailPanel.locator('button:has-text("Select This Chunk")').click();
    
    await page.waitForTimeout(1000);
    
    // Verify both conversations show linked indicator
    const linkedIndicators = page.locator('[data-testid="linked-chunk-indicator"]');
    expect(await linkedIndicators.count()).toBeGreaterThanOrEqual(2);
  });
});

test.describe('Performance Tests', () => {
  test('Chunk search responds within 500ms', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const chunkSelector = page.locator('[data-testid="chunk-selector-modal"]');
    const searchInput = chunkSelector.locator('input[placeholder*="Search chunks"]');
    
    const startTime = Date.now();
    await searchInput.fill('test query');
    
    // Wait for debounce
    await page.waitForTimeout(400);
    
    // Wait for results
    await page.waitForSelector('[data-testid^="chunk-card"]', { timeout: 5000 });
    const endTime = Date.now();
    
    const responseTime = endTime - startTime - 400; // Subtract debounce time
    expect(responseTime).toBeLessThan(500);
  });

  test('Chunk detail panel loads within 200ms', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    
    const firstConversation = page.locator('[data-testid="conversation-item"]').first();
    await firstConversation.hover();
    await firstConversation.locator('[data-testid="link-chunk-button"]').click();
    
    const firstChunk = page.locator('[data-testid^="chunk-card"]').first();
    await expect(firstChunk).toBeVisible();
    
    const startTime = Date.now();
    await firstChunk.click();
    
    await page.waitForSelector('[data-testid="chunk-detail-panel"]', { timeout: 5000 });
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    expect(loadTime).toBeLessThan(200);
  });
});

