// tests/selenium/helpers.js
// Shared utilities for Selenium tests

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

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

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

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

module.exports = { buildDriver, goto, waitFor, loginAs, By, until, BASE_URL };
