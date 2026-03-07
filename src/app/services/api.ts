// API Service for AllInOne Shop backend

import type {
  ApiResponse,
  AuthResponse,
  Brand,
  Category,
  LoginRequest,
  Product,
  RegisterRequest,
  SearchRequest,
  Store,
} from '../types/api';

// API Base URL - defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Token storage key
const TOKEN_KEY = 'allinone_token';

// Get stored auth token
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Set auth token
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove auth token
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// API fetch helper with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============ Authentication API ============

export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await apiFetch<ApiResponse<AuthResponse>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
  
  if (response.success && response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiFetch<ApiResponse<AuthResponse>>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (response.success && response.data.token) {
    setToken(response.data.token);
  }
  
  return response.data;
}

export async function getCurrentUser(): Promise<ApiResponse<import('../types/api').User>> {
  return apiFetch('/auth/me');
}

export function logout(): void {
  removeToken();
}

// ============ Products API ============

export async function searchProducts(request: SearchRequest = {}): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>('/products/search', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.data;
}

export async function getAllProducts(): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>('/products');
  return response.data;
}

export async function getProductById(id: string): Promise<Product> {
  const response = await apiFetch<ApiResponse<Product>>(`/products/${id}`);
  return response.data;
}

export async function getProductsByCategory(slug: string): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>(`/products/category/${slug}`);
  return response.data;
}

export async function getProductsByBrand(name: string): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>(`/products/brand/${encodeURIComponent(name)}`);
  return response.data;
}

export async function getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>(`/products/${productId}/similar?limit=${limit}`);
  return response.data;
}

export async function getTrendingProducts(limit = 8): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>(`/products/trending?limit=${limit}`);
  return response.data;
}

// ============ Categories API ============

export async function getAllCategories(): Promise<Category[]> {
  const response = await apiFetch<ApiResponse<Category[]>>('/categories');
  return response.data;
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  const response = await apiFetch<ApiResponse<Category>>(`/categories/slug/${slug}`);
  return response.data;
}

// ============ Brands API ============

export async function getAllBrands(): Promise<Brand[]> {
  const response = await apiFetch<ApiResponse<Brand[]>>('/brands');
  return response.data;
}

// ============ Stores API ============

export async function getAllStores(): Promise<Store[]> {
  const response = await apiFetch<ApiResponse<Store[]>>('/stores');
  return response.data;
}

// ============ Favorites API ============

export async function getFavorites(): Promise<Product[]> {
  const response = await apiFetch<ApiResponse<Product[]>>('/favorites');
  return response.data;
}

export async function getFavoriteIds(): Promise<Set<string>> {
  const response = await apiFetch<ApiResponse<string[]>>('/favorites/ids');
  return new Set(response.data);
}

export async function addFavorite(productId: string): Promise<void> {
  await apiFetch(`/favorites/${productId}`, {
    method: 'POST',
  });
}

export async function removeFavorite(productId: string): Promise<void> {
  await apiFetch(`/favorites/${productId}`, {
    method: 'DELETE',
  });
}

export async function checkFavorite(productId: string): Promise<boolean> {
  const response = await apiFetch<ApiResponse<boolean>>(`/favorites/${productId}/check`);
  return response.data;
}
