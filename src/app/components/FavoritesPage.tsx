import { useNavigate } from 'react-router';
import { Heart, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useFavorites } from '../api/hooks';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: favorites, isLoading, error } = useFavorites();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">My Favorites</h1>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-16 w-16 mx-auto text-slate-300 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Sign in to view your favorites
          </h2>
          <p className="text-slate-600 mb-6">
            Create an account or sign in to save your favorite products
          </p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold">My Favorites</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4">
                <Skeleton className="aspect-square w-full mb-4" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">Failed to load favorites. Please try again.</p>
          </div>
        ) : favorites && favorites.length > 0 ? (
          <>
            <p className="text-slate-600 mb-6">{favorites.length} saved items</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favorites.map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    name: product.name,
                    brand: product.brand?.name || 'Unknown',
                    category: product.category?.name || 'Unknown',
                    description: product.description || '',
                    imageUrl: product.imageUrl || '',
                    prices: product.prices.map((p) => ({
                      storeId: p.store.id,
                      price: p.price,
                      currency: p.currency,
                      productUrl: p.productUrl,
                    })),
                  }}
                  showFavoriteButton
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              No favorites yet
            </h2>
            <p className="text-slate-600 mb-6">
              Start adding products to your favorites by clicking the heart icon
            </p>
            <Button onClick={() => navigate('/search')}>Browse Products</Button>
          </div>
        )}
      </div>
    </div>
  );
}
