import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import * as api from '../services/api';
import type { Product, SearchRequest } from '../types/api';

// Fetcher functions
const productsFetcher = () => api.getAllProducts();
const trendingFetcher = (limit: number) => () => api.getTrendingProducts(limit);
const productByIdFetcher = (id: string) => () => api.getProductById(id);
const similarProductsFetcher = (id: string, limit: number) => () => api.getSimilarProducts(id, limit);
const productsByCategoryFetcher = (slug: string) => () => api.getProductsByCategory(slug);
const productsByBrandFetcher = (name: string) => () => api.getProductsByBrand(name);

// Hook for all products
export function useProducts() {
  const { data, error, isLoading, mutate } = useSWR<Product[]>(
    'products',
    productsFetcher
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}

// Hook for trending products
export function useTrendingProducts(limit = 8) {
  const { data, error, isLoading } = useSWR<Product[]>(
    `products/trending/${limit}`,
    trendingFetcher(limit)
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for single product
export function useProduct(id: string | null) {
  const { data, error, isLoading } = useSWR<Product>(
    id ? `products/${id}` : null,
    id ? productByIdFetcher(id) : null
  );

  return {
    product: data,
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for similar products
export function useSimilarProducts(productId: string | null, limit = 4) {
  const { data, error, isLoading } = useSWR<Product[]>(
    productId ? `products/${productId}/similar/${limit}` : null,
    productId ? similarProductsFetcher(productId, limit) : null
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for products by category
export function useProductsByCategory(slug: string | null) {
  const { data, error, isLoading } = useSWR<Product[]>(
    slug ? `products/category/${slug}` : null,
    slug ? productsByCategoryFetcher(slug) : null
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for products by brand
export function useProductsByBrand(brandName: string | null) {
  const { data, error, isLoading } = useSWR<Product[]>(
    brandName ? `products/brand/${brandName}` : null,
    brandName ? productsByBrandFetcher(brandName) : null
  );

  return {
    products: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for searching products with filters
export function useSearchProducts() {
  const { trigger, data, error, isMutating } = useSWRMutation<
    Product[],
    Error,
    string,
    SearchRequest
  >('products/search', async (_, { arg }) => {
    return api.searchProducts(arg);
  });

  return {
    search: trigger,
    products: data || [],
    isSearching: isMutating,
    isError: !!error,
    error,
  };
}
