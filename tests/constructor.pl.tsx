import { test, expect } from '@playwright/test';
import path from 'path';

const HAR_FILE = path.join(__dirname, 'hars', 'stellar-burgers.har');
const BUN_NAME = 'Краторная булка N-200i';
const FILLING_NAME = 'Биокотлета из марсианской Магнолии';
const BUN_CALORIES = '420';
const ORDER_NUMBER = '54321';

test.beforeEach(async ({ page }) => {
  await page.routeFromHAR(HAR_FILE, {
    url: '**/api/**',
    update: false,
    notFound: 'fallback'
  });
  await page.goto('/');
});

test.describe('Добавление ингредиентов в конструктор', () => {
  test('добавляет булку в конструктор по кнопке добавить', async ({ page }) => {
    const bunItem = page.locator('li').filter({ hasText: BUN_NAME }).first();
    await bunItem.getByRole('button').click();

    const constructor = page.locator('[data-testid="burgerConstructor"]');
    await expect(constructor).toContainText(`${BUN_NAME} (верх)`);
    await expect(constructor).toContainText(`${BUN_NAME} (низ)`);
  });

  test('добавляет начинку в конструктор по кнопке добавить', async ({
    page
  }) => {
    const fillingItem = page
      .locator('li')
      .filter({ hasText: FILLING_NAME })
      .first();
    await fillingItem.getByRole('button').click();

    const constructor = page.locator('[data-testid="burgerConstructor"]');
    await expect(constructor).toContainText(FILLING_NAME);
  });
});

test.describe('Модальное окно ингредиента', () => {
  test('открывает модальное окно при клике на ингредиент', async ({ page }) => {
    await page.locator('li').filter({ hasText: BUN_NAME }).first().click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText('Детали ингредиента');
    await expect(modal).toContainText(BUN_NAME);
  });

  test('отображает данные именно того ингредиента, по которому произошел клик', async ({
    page
  }) => {
    await page.locator('li').filter({ hasText: BUN_NAME }).first().click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toContainText(BUN_NAME);
    await expect(modal).toContainText(BUN_CALORIES);
  });

  test('закрывает модальное окно по кнопке X', async ({ page }) => {
    await page.locator('li').filter({ hasText: BUN_NAME }).first().click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    await modal.getByRole('button').first().click();

    await expect(modal).not.toBeVisible();
  });

  test('закрывает модальное окно по клику на оверлей', async ({ page }) => {
    await page.locator('li').filter({ hasText: BUN_NAME }).first().click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    await page.mouse.click(10, 10);

    await expect(modal).not.toBeVisible();
  });
});

test.describe('Создание заказа', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().addCookies([
      {
        name: 'accessToken',
        value: 'Bearer test-access-token',
        domain: 'localhost',
        path: '/'
      }
    ]);
    await page.evaluate(() => {
      localStorage.setItem('refreshToken', 'test-refresh-token');
    });
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.removeItem('refreshToken');
    });
  });

  test('оформляет заказ и показывает верный номер в модальном окне', async ({
    page
  }) => {
    const bunItem = page.locator('li').filter({ hasText: BUN_NAME }).first();
    await bunItem.getByRole('button').click();

    const fillingItem = page
      .locator('li')
      .filter({ hasText: FILLING_NAME })
      .first();
    await fillingItem.getByRole('button').click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();
    await expect(modal).toContainText(ORDER_NUMBER);
  });

  test('очищает конструктор после оформления заказа', async ({ page }) => {
    const bunItem = page.locator('li').filter({ hasText: BUN_NAME }).first();
    await bunItem.getByRole('button').click();

    const fillingItem = page
      .locator('li')
      .filter({ hasText: FILLING_NAME })
      .first();
    await fillingItem.getByRole('button').click();

    await page.getByRole('button', { name: 'Оформить заказ' }).click();

    const modal = page.locator('[data-testid="modal"]');
    await expect(modal).toBeVisible();

    await modal.getByRole('button').first().click();
    await expect(modal).not.toBeVisible();

    const constructor = page.locator('[data-testid="burgerConstructor"]');
    await expect(constructor).not.toContainText(`${BUN_NAME} (верх)`);
    await expect(constructor).not.toContainText(FILLING_NAME);
  });
});
