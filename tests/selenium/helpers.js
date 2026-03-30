// tests/selenium/helpers.js
// Shared utilities for Selenium tests

const fs   = require('fs');
const path = require('path');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { ServiceBuilder } = require('selenium-webdriver/chrome');

const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

/**
 * Build a headless Chrome WebDriver.
 */
async function buildDriver() {
  const options = new chrome.Options();
  options.addArguments(
    '--headless=new',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1280,800'
  );

  // In CI, browser-actions/setup-chrome exports CHROME_PATH
  if (process.env.CHROME_PATH) {
    options.setChromeBinaryPath(process.env.CHROME_PATH);
  }

  const builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options);

  // In CI, use the matching ChromeDriver binary provided by setup-chrome
  if (process.env.CHROMEDRIVER_PATH) {
    builder.setChromeService(new ServiceBuilder(process.env.CHROMEDRIVER_PATH));
  }

  const driver = await builder.build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 15000 });
  return driver;
}

/**
 * Navigate to a path relative to BASE_URL.
 */
async function goto(driver, path) {
  await driver.get(`${BASE_URL}${path}`);
}

/**
 * Wait for an element by CSS selector and return it.
 */
async function waitFor(driver, css, timeoutMs = 8000) {
  return driver.wait(until.elementLocated(By.css(css)), timeoutMs);
}

/**
 * Login as a specific user and return to the redirected page.
 */
async function loginAs(driver, email, password) {
  await goto(driver, '/login.html');
  await (await waitFor(driver, 'input[name="email"]')).sendKeys(email);
  await driver.findElement(By.css('input[name="password"]')).sendKeys(password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  // Wait until redirect away from login page
  await driver.wait(until.urlContains('localhost:3000'), 8000);
  await driver.wait(async () => {
    const url = await driver.getCurrentUrl();
    return !url.includes('login.html');
  }, 8000);
}

/**
 * Scroll an element into view and click it, avoiding ElementClickInterceptedError
 * caused by fixed headers/footers obscuring the element.
 */
async function safeClick(driver, element) {
  await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', element);
  await driver.sleep(200); // allow scroll + any sticky-header animation to settle
  await element.click();
}

/**
 * Capture a screenshot when a Mocha test has failed and save it to
 * tests/selenium/results/screenshots/<test-title>.png
 */
async function screenshotOnFailure(driver, currentTest) {
  if (!driver || !currentTest || currentTest.state !== 'failed') return;
  try {
    const img  = await driver.takeScreenshot();
    const name = currentTest.fullTitle().replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');
    const dir  = path.join(__dirname, 'results', 'screenshots');
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${name}.png`), img, 'base64');
  } catch (_) {
    // never let a screenshot failure mask the real test failure
  }
}

module.exports = { buildDriver, goto, waitFor, safeClick, loginAs, screenshotOnFailure, By, until, BASE_URL };
