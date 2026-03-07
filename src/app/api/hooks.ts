// SWR hooks for data fetching
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { productApi, catalogApi, favoritesApi, authApi } from './client';
import type { SearchRequest } from './types';

// Product hooks
export function useProducts() {
  return useSWR('products', () => productApi.getAll().then(r => r.data));
}

export function useProduct(id: string | undefined) {
  return useSWR(
    id ? `product-${id}` : null,
    () => productApi.getById(id!).then(r => r.data)
  );
}

export function useProductSearch(request: SearchRequest) {
  const key = JSON.stringify({ search: request });
  return useSWR(key, () => productApi.search(request).then(r => r.data));
}

export function useSimilarProducts(productId: string | undefined, limit = 4) {
  return useSWR(
    productId ? `similar-${productId}` : null,
    () => productApi.getSimilar(productId!, limit).then(r => r.data)
  );
}

export function useTrendingProducts(limit = 8) {
  return useSWR('trending', () => productApi.getTrending(limit).then(r => r.data));
}

// Catalog hooks
export function useCategories() {
  return useSWR('categories', () => catalogApi.getCategories().then(r => r.data));
}

export function useBrands() {
  return useSWR('brands', () => catalogApi.getBrands().then(r => r.data));
}

export function useStores() {
  return useSWR('stores', () => catalogApi.getStores().then(r => r.data));
}

// Favorites hooks
export function useFavorites() {
  return useSWR('favorites', () => favoritesApi.getAll().then(r => r.data));
}

export function useFavoriteIds() {
  return useSWR('favorite-ids', () => favoritesApi.getIds().then(r => r.data));
}

export function useAddFavorite() {
  return useSWRMutation(
    'favorites',
    (_, { arg }: { arg: string }) => favoritesApi.add(arg)
  );
}

export function useRemoveFavorite() {
  return useSWRMutation(
    'favorites',
    (_, { arg }: { arg: string }) => favoritesApi.remove(arg)
  );
}

// Auth hooks
export function useCurrentUser() {
  return useSWR('current-user', () => authApi.getCurrentUser().then(r => r.data), {
    revalidateOnFocus: false,
  });
}
