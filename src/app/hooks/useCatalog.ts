import useSWR from 'swr';
import * as api from '../services/api';
import type { Brand, Category, Store } from '../types/api';

// Fetcher functions
const categoriesFetcher = () => api.getAllCategories();
const brandsFetcher = () => api.getAllBrands();
const storesFetcher = () => api.getAllStores();

// Hook for all categories
export function useCategories() {
  const { data, error, isLoading } = useSWR<Category[]>(
    'categories',
    categoriesFetcher
  );

  return {
    categories: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for all brands
export function useBrands() {
  const { data, error, isLoading } = useSWR<Brand[]>(
    'brands',
    brandsFetcher
  );

  return {
    brands: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}

// Hook for all stores
export function useStores() {
  const { data, error, isLoading } = useSWR<Store[]>(
    'stores',
    storesFetcher
  );

  return {
    stores: data || [],
    isLoading,
    isError: !!error,
    error,
  };
}
