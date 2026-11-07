import { resolve } from 'node:path';
import { test, expect } from '../e2e/account/fixtures';
import { seedCatalog } from '../e2e/catalog-web/seed';
import { textContrast } from './contrast';

test('login is keyboard operable with visible focus, named controls and focused understandable errors', async ({ page, app }) => {
  await page.goto(app.origin + '/#/login');
  const form = page.getByRole('form', { name: 'Bom te ver de novo' });
  const email = form.getByLabel('E-mail', { exact: true }), password = form.getByLabel('Senha', { exact: true });
  for (let step = 0; step < 30 && !await email.evaluate(element => document.activeElement === element); step++) await page.keyboard.press('Tab');
  await expect(email).toBeFocused();
  expect(await email.evaluate(element => element.matches(':focus-visible') && parseFloat(getComputedStyle(element).outlineWidth) >= 2)).toBe(true);
  await page.keyboard.type(app.credentials.operatorEmail);
  await page.keyboard.press('Tab'); await expect(password).toBeFocused();
  await page.keyboard.type('Senha sintética incorreta para conferir o erro!');
  await page.keyboard.press('Enter');
  const alert = form.getByRole('alert');
  await expect(alert).toBeVisible(); await expect(alert).toBeFocused();
  await expect(alert).toContainText(/credenciais|sessão/i);
  for (const target of [email, password, form.getByRole('button', { name: 'Entrar', exact: true }), alert]) {
    const contrast = await textContrast(target);
    expect(contrast.ratio).toBeGreaterThanOrEqual(contrast.minimum);
  }
  await password.fill(app.credentials.operatorPassword);
  await password.press('Enter');
  await expect(page.getByRole('link', { name: 'Minha conta', exact: true })).toBeVisible();
  await page.screenshot({ path: resolve(app.directory, 'acceptance-keyboard.png'), fullPage: true });
});

test('catalog and account remain usable at 390px and 200 percent text with described product images', async ({ page, app }) => {
  const data = await seedCatalog(page, app.origin, app.credentials.adminEmail, app.credentials.adminPassword);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/#/login', '/#/catalog?q=' + encodeURIComponent(data.marker), '/#/edition?id=' + data.main]) {
    await page.goto(app.origin + path);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    if (path.includes('catalog')) await expect(page.getByRole('link', { name: data.mainTitle, exact: true })).toBeVisible();
    if (path.includes('edition')) {
      await expect(page.getByRole('heading', { name: data.mainTitle, exact: true })).toBeVisible();
      const images = page.locator('img'); expect(await images.count()).toBeGreaterThan(0);
      expect(await images.evaluateAll(elements => elements.every(element => Boolean(element.getAttribute('alt')?.trim())))).toBe(true);
      for (const image of await images.all()) {
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).complete && (element as HTMLImageElement).naturalWidth > 0)).toBe(true);
      }
      const labels = await page.locator('.shop-metadata dt').evaluateAll(elements => elements.map(element => {
        const range = document.createRange(); range.selectNodeContents(element);
        return { lines: range.getClientRects().length, words: element.textContent!.trim().split(/\s+/).length };
      }));
      expect(labels.length).toBeGreaterThan(0);
      for (const label of labels) expect(label.lines).toBeLessThanOrEqual(label.words);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await page.screenshot({ path: resolve(app.directory, 'acceptance-200-' + (path.includes('edition') ? 'edition' : path.includes('catalog') ? 'catalog' : 'account') + '.png'), fullPage: true });
  }
});
