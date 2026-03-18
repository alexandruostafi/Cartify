// tests/selenium/auth.test.js
// Selenium tests for register and login flows

const assert = require('node:assert/strict');
const { buildDriver, goto, waitFor, loginAs, By, until } = require('./helpers');

let driver;
const UNIQUE    = Date.now();
const TEST_USER = {
  name:     `Selenium User ${UNIQUE}`,
  email:    `selenium${UNIQUE}@example.com`,
  password: 'seleniumpass123',
};

describe('Authentication (Selenium)', function () {
  this.timeout(40000);

  before(async () => {
    driver = await buildDriver();
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  // ── Register ──────────────────────────────────────────────────────────────
  it('register page loads with a form', async () => {
    await goto(driver, '/register.html');
    await waitFor(driver, '#registerForm');
    const heading = await driver.findElement(By.css('h2'));
    assert.ok((await heading.getText()).includes('Create Account'));
  });

  it('successful registration redirects to home', async () => {
    await goto(driver, '/register.html');
    await (await waitFor(driver, 'input[name="name"]')).sendKeys(TEST_USER.name);
    await driver.findElement(By.css('input[name="email"]')).sendKeys(TEST_USER.email);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(TEST_USER.password);
    await driver.findElement(By.css('button[type="submit"]')).click();

    await driver.wait(async () => {
      const url = await driver.getCurrentUrl();
      return !url.includes('register.html');
    }, 10000);

    const url = await driver.getCurrentUrl();
    assert.ok(!url.includes('register.html'), `Still on register page: ${url}`);
  });

});
