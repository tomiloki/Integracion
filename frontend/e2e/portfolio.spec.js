const { expect, test } = require('@playwright/test');

const API_BASE_URL = process.env.E2E_API_URL || 'http://127.0.0.1:8000/api';
const ACCESS_KEY = process.env.E2E_ACCESS_KEY || 'access';

function buildUser() {
  const unique = Date.now();
  return {
    username: `e2e_user_${unique}`,
    email: `e2e_${unique}@mail.test`,
    password: 'E2ePass!9',
  };
}

async function registerAndLogin(page, user) {
  await page.goto('/register');
  await page.getByTestId('register-username').fill(user.username);
  await page.getByTestId('register-email').fill(user.email);
  await page.getByTestId('register-password').fill(user.password);
  await page.getByTestId('register-confirm-password').fill(user.password);
  await page.getByTestId('register-role').selectOption('customer');
  await page.getByTestId('register-submit').click();

  await expect(page).toHaveURL(/\/login/);

  await page.getByTestId('login-username').fill(user.username);
  await page.getByTestId('login-password').fill(user.password);
  await page.getByTestId('login-submit').click();
  await expect(page).toHaveURL(/\/catalog/);
}

async function addDemoProductToCart({ page, request }) {
  const token = await page.evaluate((accessKey) => localStorage.getItem(accessKey), ACCESS_KEY);
  expect(token).toBeTruthy();

  const preferredResponse = await request.get(`${API_BASE_URL}/products/?q=PORT-DEMO-001`);
  expect(preferredResponse.ok()).toBeTruthy();
  const preferredPayload = await preferredResponse.json();
  let products = preferredPayload.results || [];

  if (products.length === 0) {
    const fallbackResponse = await request.get(`${API_BASE_URL}/products/`);
    expect(fallbackResponse.ok()).toBeTruthy();
    const fallbackPayload = await fallbackResponse.json();
    products = fallbackPayload.results || [];
  }

  expect(products.length).toBeGreaterThan(0);

  const productId = products[0].id;
  const addResponse = await request.post(`${API_BASE_URL}/cart/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      product_id: productId,
      quantity: 1,
    },
  });
  expect(addResponse.ok()).toBeTruthy();
}

test('register + login + profile works', async ({ page }) => {
  const user = buildUser();
  await registerAndLogin(page, user);

  await page.getByTestId('nav-profile-link').click();
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByTestId('profile-username')).toContainText(user.username);
});

test('customer can add to cart, ir al pago y mantener carrito si no paga', async ({ page, request }) => {
  const user = buildUser();
  await registerAndLogin(page, user);

  await addDemoProductToCart({ page, request });

  await page.goto('/cart');
  await expect(page).toHaveURL(/\/cart/);
  await expect(page.getByTestId('cart-list')).toBeVisible();

  await page.getByTestId('cart-checkout-btn').click();
  await expect(page).toHaveURL(/\/order\/\d+/);
  await expect(page.getByTestId('order-total')).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByTestId('cart-list')).toBeVisible();
  await expect(page.getByTestId('cart-list').locator('li')).toHaveCount(1);
});

test('product add updates navbar badge and shows inline feedback', async ({ page }) => {
  const user = buildUser();
  await registerAndLogin(page, user);

  await page.goto('/catalog');
  const addButtons = page.locator('[data-testid^="product-add-btn-"]');
  await expect(addButtons.first()).toBeVisible();
  await addButtons.first().click();

  await expect(page.getByTestId('nav-cart-count')).toContainText('1');
  await expect(page.getByText('Producto agregado al carrito')).toBeVisible();
});

test('admin route is protected for unauthenticated users', async ({ page }) => {
  await page.goto('/admin-app');
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByTestId('login-form')).toBeVisible();
});
