import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import App from './App';
import Navbar from './components/Navbar';
import ProductCard from './components/productCard';
import Catalog from './pages/catalog';
import Login from './pages/login';
import * as authContext from './context/authContext';
import { addToCart } from './services/cartService';
import { getCategories } from './services/categoryService';
import { getProducts } from './services/productService';

jest.mock('./services/categoryService', () => ({
  getCategories: jest.fn(),
}));

jest.mock('./services/productService', () => ({
  getProducts: jest.fn(),
}));

jest.mock('./services/cartService', () => ({
  addToCart: jest.fn(),
  getCartItems: jest.fn(),
}));

jest.mock('./context/authContext', () => {
  const actual = jest.requireActual('./context/authContext');
  return {
    ...actual,
    useAuth: jest.fn(),
  };
});

const sampleProduct = {
  id: 10,
  sku: 'SKU-10',
  brand: 'ACME',
  name: 'Filtro premium',
  category: { id: 1, name: 'Filtros' },
  price: 19990,
  effective_price: 19990,
  is_b2b_price: false,
  quantity: 4,
  image: '',
  description: 'Filtro de alto flujo',
};

function renderWithRouter(ui, route = '/') {
  window.history.pushState({}, 'Test page', route);
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}

beforeEach(() => {
  jest.clearAllMocks();
  authContext.useAuth.mockReturnValue({
    isLoggedIn: false,
    role: undefined,
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
  });
  getCategories.mockResolvedValue([{ id: 1, name: 'Filtros' }]);
  getProducts.mockResolvedValue({ results: [sampleProduct] });
});

test('protected admin route redirects unauthenticated users to login', async () => {
  window.history.pushState({}, 'Admin', '/admin-app');

  render(<App />);

  expect(await screen.findByTestId('login-form')).toBeInTheDocument();
});

test('login submits credentials and navigates on success', async () => {
  const login = jest.fn().mockResolvedValue({ success: true });
  authContext.useAuth.mockReturnValue({ login });

  renderWithRouter(<Login />);

  fireEvent.change(screen.getByTestId('login-username'), { target: { value: 'cliente_demo' } });
  fireEvent.change(screen.getByTestId('login-password'), { target: { value: 'local-test-password' } });
  fireEvent.click(screen.getByTestId('login-submit'));

  await waitFor(() => {
    expect(login).toHaveBeenCalledWith({ username: 'cliente_demo', password: 'local-test-password' });
  });
});

test('catalog renders loaded products and category filters', async () => {
  renderWithRouter(<Catalog />);

  expect(await screen.findByText('Filtro premium')).toBeInTheDocument();
  expect(screen.getByTestId('catalog-category-all')).toBeInTheDocument();
  expect(screen.getByTestId('catalog-category-1')).toHaveTextContent('Filtros');
});

test('catalog shows a recoverable error state when product loading fails', async () => {
  getProducts.mockRejectedValueOnce(new Error('network'));

  renderWithRouter(<Catalog />);

  expect(await screen.findByText('No fue posible cargar los productos para este filtro.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
});

test('product card adds a product to cart and shows inline feedback', async () => {
  addToCart.mockResolvedValue({ id: 1 });

  renderWithRouter(<ProductCard product={sampleProduct} />);
  fireEvent.click(screen.getByTestId('product-add-btn-10'));

  await waitFor(() => expect(addToCart).toHaveBeenCalledWith(10, 1));
  expect(await screen.findByText('Producto agregado al carrito')).toBeInTheDocument();
});

test('navbar renders cart badge using authenticated cart state', async () => {
  const { getCartItems } = require('./services/cartService');
  getCartItems.mockResolvedValue([{ quantity: 2 }, { quantity: 3 }]);
  authContext.useAuth.mockReturnValue({
    isLoggedIn: true,
    role: 'customer',
    user: { username: 'cliente_demo', role: 'customer' },
    logout: jest.fn(),
  });

  renderWithRouter(<Navbar />);

  expect(await screen.findByTestId('nav-cart-count')).toHaveTextContent('5');
});
