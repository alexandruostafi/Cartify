// tests/selenium/auth.test.js
// Selenium tests for register and login flows

const assert = require('node:assert/strict');
const { buildDriver, goto, waitFor, loginAs, screenshotOnFailure, By, until } = require('./helpers');

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

  afterEach(async function () {
    await screenshotOnFailure(driver, this.currentTest);
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
    it('login page loads with a form', async () => {
      await goto(driver, '/register.html');
      await waitFor(driver, '#registerForm');
      const heading = await driver.findElement(By.css('h2'));
      assert.ok((await heading.getText()).includes('Create Account'));
    });

    it('duplicate email registration shows an error message', async () => {
      await goto(driver, '/register.html');
      await (await waitFor(driver, 'input[name="name"]')).sendKeys('Dup');
      await driver.findElement(By.css('input[name="email"]')).sendKeys('jane@example.com');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('whatever123');
      await driver.findElement(By.css('button[type="submit"]')).click();

      const errEl = await waitFor(driver, '#registerError');
      await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
      const msg = await errEl.getText();
      assert.ok(msg.length > 0, 'Expected an error message for duplicate email');
    });

    it('user authentication with empty password', async() => {
      await goto(driver, '/register.html');
      await (await waitFor(driver, 'input[name="name"]')).sendKeys('EmptyPassUser');
      await driver.findElement(By.css('input[name="email"]')).sendKeys('empty_pass@example.com');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      const errEl = await waitFor(driver, '#registerError');
      await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
      const msg = await errEl.getText();
      assert.ok(msg.length > 0, 'Expected an error message for empty password');
    });

    it('user authentication with empty email', async() => {
      await goto(driver, '/register.html');
      await (await waitFor(driver, 'input[name="name"]')).sendKeys('EmptyEmailUser');
      await driver.findElement(By.css('input[name="email"]')).sendKeys('');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('emptyemailuser123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      const errEl = await waitFor(driver, '#registerError');
      await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
      const msg = await errEl.getText();
      assert.ok(msg.length > 0, 'Expected an error message for empty email');
    });

    it('user authentication with empty username', async() => {
      await goto(driver, '/register.html');
      await (await waitFor(driver, 'input[name="name"]')).sendKeys('');
      await driver.findElement(By.css('input[name="email"]')).sendKeys('emptyusername@example.com');
      await driver.findElement(By.css('input[name="password"]')).sendKeys('emptyusername123');
      await driver.findElement(By.css('button[type="submit"]')).click();
      
      const errEl = await waitFor(driver, '#registerError');
      await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
      const msg = await errEl.getText();
      assert.ok(msg.length > 0, 'Expected an error message for empty username');
    });

  //: ── Login ────────────────────────────────────────────────────────────────
  it('login page loads with a form', async () => {
    await goto(driver, '/login.html');
    await waitFor(driver, '#loginForm');
    const heading = await driver.findElement(By.css('h2'));
    assert.ok((await heading.getText()).includes('Login'));
  });

  it('login with wrong password shows error', async () => {
    await goto(driver, '/login.html');
    await (await waitFor(driver, 'input[name=email]')).sendKeys('jane@example.com');
    await (await waitFor(driver, 'input[name=password]')).sendKeys('badpassword');
    await (await waitFor(driver, 'button[type=submit]')).click();

    const errEl = await waitFor(driver, '#loginError');
    await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
    const msg = await errEl.getText();
    assert.ok(msg.length > 0, 'Expected an error for wrong password');
  });

  it('customer login succeeds and redirects to home', async () => {
    await loginAs(driver, 'jane@example.com', 'customer123');
    const url = await driver.getCurrentUrl();
    assert.ok(url.endsWith('/') || url.includes('index.html'), `Unexpected URL: ${url}`);
  });

  it('admin login redirects to admin panel', async () => {
    await loginAs(driver, 'admin@shop.com', 'admin123');
    const url = await driver.getCurrentUrl();
    assert.ok(url.includes('admin.html'), `Expected admin.html, got: ${url}`);
  });

  it('customer login with empty password shows error', async () => {
    await goto(driver, '/login.html');
    await (await waitFor(driver, 'input[name=email]')).sendKeys('jane@example.com');
    await (await waitFor(driver, 'input[name=password]')).sendKeys('');
    await (await waitFor(driver, 'button[type=submit]')).click();

    const errEl = await waitFor(driver, '#loginError');
    await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
    const msg = await errEl.getText();
    assert.ok(msg.length > 0, 'Expected an error for empty password');
  });

  it('customer login with empty email shows error', async () => {
    await goto(driver, '/login.html');
    await (await waitFor(driver, 'input[name=email]')).sendKeys('');
    await (await waitFor(driver, 'input[name=password]')).sendKeys('whatever123');
    await (await waitFor(driver, 'button[type=submit]')).click();

    const errEl = await waitFor(driver, '#loginError');
    await driver.wait(until.elementTextMatches(errEl, /.+/), 5000);
    const msg = await errEl.getText();
    assert.ok(msg.length > 0, 'Expected an error for empty email');
  });
});
