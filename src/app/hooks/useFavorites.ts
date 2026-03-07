import { useCallback } from 'react';
import useSWR from 'swr';
import * as api from '../services/api';
import type { Product } from '../types/api';

// Hook for managing favorites
export function useFavorites() {
  const hasToken = !!api.getToken();

  // Fetch favorite products
  const { 
    data: favorites, 
    error: favoritesError, 
    isLoading: isLoadingFavorites,
    mutate: mutateFavorites,
  } = useSWR<Product[]>(
    hasToken ? 'favorites' : null,
    api.getFavorites,
    { revalidateOnFocus: false }
  );

  // Fetch favorite IDs for quick lookup
  const {
    data: favoriteIds,
    mutate: mutateFavoriteIds,
  } = useSWR<Set<string>>(
    hasToken ? 'favorites/ids' : null,
    api.getFavoriteIds,
    { revalidateOnFocus: false }
  );

  // Add to favorites
  const addFavorite = useCallback(async (productId: string) => {
    if (!hasToken) {
      throw new Error('Please login to add favorites');
    }

    // Optimistic update
    mutateFavoriteIds(
      (current) => {
        const newSet = new Set(current);
        newSet.add(productId);
        return newSet;
      },
      false
    );

    try {
      await api.addFavorite(productId);
      // Revalidate both lists
      mutateFavorites();
      mutateFavoriteIds();
    } catch (error) {
      // Rollback on error
      mutateFavoriteIds();
      throw error;
    }
  }, [hasToken, mutateFavorites, mutateFavoriteIds]);

  // Remove from favorites
  const removeFavorite = useCallback(async (productId: string) => {
    if (!hasToken) {
      throw new Error('Please login to manage favorites');
    }

    // Optimistic update
    mutateFavoriteIds(
      (current) => {
        const newSet = new Set(current);
        newSet.delete(productId);
        return newSet;
      },
      false
    );

    mutateFavorites(
      (current) => current?.filter(p => p.id !== productId),
      false
    );

    try {
      await api.removeFavorite(productId);
      // Revalidate both lists
      mutateFavorites();
      mutateFavoriteIds();
    } catch (error) {
      // Rollback on error
      mutateFavorites();
      mutateFavoriteIds();
      throw error;
    }
  }, [hasToken, mutateFavorites, mutateFavoriteIds]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (productId: string) => {
    const isFav = favoriteIds?.has(productId);
    if (isFav) {
      await removeFavorite(productId);
    } else {
      await addFavorite(productId);
    }
  }, [favoriteIds, addFavorite, removeFavorite]);

  // Check if product is favorited
  const isFavorite = useCallback((productId: string) => {
    return favoriteIds?.has(productId) || false;
  }, [favoriteIds]);

  return {
    favorites: favorites || [],
    favoriteIds: favoriteIds || new Set<string>(),
    isLoading: isLoadingFavorites,
    isError: !!favoritesError,
    error: favoritesError,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    isAuthenticated: hasToken,
  };
}
