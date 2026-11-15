const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, 'demo-output');
const FINAL_VIDEO_PATH = path.join(OUTPUT_DIR, 'saathi-demo.mp4');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage', '--single-process', '--disable-software-rasterizer'],
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  // Enable console logging
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  const BASE = 'http://localhost:3000';

  try {
    console.log('🎬 Starting Saathi demo recording...');

    // ============ LANDING PAGE ============
    console.log('📍 Landing page...');
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 60000 });
    await sleep(4000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(2000);

    // ============ FLOW 1: Elder View ============
    console.log('📱 FLOW 1: Elder View');

    // Navigate directly to elder home
    await page.goto(`${BASE}/elder`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);
    console.log('  ✅ Elder home loaded');

    // Navigate to medicines page
    await page.goto(`${BASE}/elder/medicines`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);
    console.log('  ✅ Medicines page loaded');

    // Navigate to why-skipped page
    await page.goto(`${BASE}/elder/why-skipped`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(4000);
    console.log('  ✅ Why skipped page loaded');

    // Try to interact with the form
    try {
      await page.waitForSelector('textarea', { timeout: 10000 });
      await page.fill('textarea', 'bhool gayi');
      await sleep(1000);
      console.log('  ✅ Filled "bhool gayi"');
    } catch (e) {
      console.log('  ⚠️ Could not fill textarea');
    }

    // Try to click Forgot card
    try {
      await page.click('text="Forgot"', { force: true, timeout: 5000 });
      await sleep(1500);
      console.log('  ✅ Clicked Forgot card');
    } catch (e) {
      console.log('  ⚠️ Could not click Forgot card');
    }

    // Try to click Submit
    try {
      await page.click('button:has-text("Submit")', { force: true, timeout: 5000 });
      await sleep(2000);
      console.log('  ✅ Clicked Submit');
    } catch (e) {
      console.log('  ⚠️ Could not click Submit');
    }

    // Wait for result
    await sleep(3000);

    // ============ FLOW 2: Caregiver Dashboard ============
    console.log('📊 FLOW 2: Caregiver Dashboard');
    await page.goto(`${BASE}/caregiver`, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(5000);
    console.log('  ✅ Caregiver dashboard loaded');

    // Scroll down to show sections
    await page.evaluate(() => window.scrollBy(0, 500));
    await sleep(2000);
    await page.evaluate(() => window.scrollBy(0, 500));
    await sleep(2000);
    await page.evaluate(() => window.scrollBy(0, 500));
    await sleep(2000);
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(2000);

    // Hover call button if visible
    try {
      const callBtn = await page.locator('button:has-text("Call")').first();
      if (await callBtn.isVisible({ timeout: 2000 })) {
        await callBtn.hover();
        await sleep(1000);
        console.log('  ✅ Call button hovered');
      }
    } catch (e) {
      console.log('  ⚠️ Call button not found');
    }

    // ============ FLOW 3: Doctor Note ============
    console.log('🩺 FLOW 3: Doctor Note feature');
    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await sleep(3000);

    // Scroll to Doctor Ki Baat feature
    await page.evaluate(() => {
      const cards = document.querySelectorAll('article');
      cards.forEach(card => {
        if (card.textContent.includes('Doctor Ki Baat')) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
    await sleep(4000);

    // ============ FLOW 4: Fasting Planner ============
    console.log('🕌 FLOW 4: Fasting Planner feature');
    await page.evaluate(() => {
      const cards = document.querySelectorAll('article');
      cards.forEach(card => {
        if (card.textContent.includes('Vrat-Roza-Tyohar') || card.textContent.includes('Navratri')) {
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    });
    await sleep(4000);

    // Final summary - landing page top
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(4000);

    console.log('✅ Demo recording complete!');

  } catch (error) {
    console.error('❌ Error during demo:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

runDemo().catch(console.error);