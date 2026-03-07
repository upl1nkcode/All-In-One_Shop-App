import { ExternalLink, ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { products, stores } from '../data/mockData';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';

export function ProductDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-slate-900">Product not found</h2>
          <Button onClick={() => navigate('/')}>Go back home</Button>
        </div>
      </div>
    );
  }

  const lowestPrice = Math.min(...product.prices.map((p) => p.price));
  const sortedPrices = [...product.prices].sort((a, b) => a.price - b.price);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft size={20} />
              </Button>
              <h1
                className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
                onClick={() => navigate('/')}
              >
                AllInOne Shop
              </h1>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Heart size={20} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="aspect-square">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.brand}
              </Badge>
              <h1 className="text-3xl font-bold mb-2 text-slate-900">{product.name}</h1>
              <p className="text-slate-600">{product.category}</p>
            </div>

            {/* Price Info */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm text-slate-600">Lowest price:</span>
                  <span className="text-4xl font-bold text-slate-900">
                    €{lowestPrice}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Available at {product.prices.length} stores
                </p>
              </CardContent>
            </Card>

            {/* Description */}
            <div>
              <h3 className="font-bold text-lg mb-2 text-slate-900">Description</h3>
              <p className="text-slate-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Product Details */}
            <div className="bg-white rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Brand</span>
                <span className="font-semibold text-slate-900">{product.brand}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Category</span>
                <span className="font-semibold text-slate-900">{product.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Availability</span>
                <span className="font-semibold text-green-600">In Stock</span>
              </div>
            </div>
          </div>
        </div>

        {/* Where to Buy */}
        <div className="bg-white rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Where to Buy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPrices.map((price) => {
              const store = stores.find((s) => s.id === price.storeId);
              const isLowest = price.price === lowestPrice;
              return (
                <Card
                  key={price.storeId}
                  className={`hover:shadow-lg transition-shadow ${
                    isLowest ? 'border-2 border-green-500' : ''
                  }`}
                >
                  <CardContent className="p-6">
                    {isLowest && (
                      <Badge className="mb-2 bg-green-500">Best Price</Badge>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">{store?.name}</h3>
                        <p className="text-sm text-slate-600">{store?.website}</p>
                      </div>
                    </div>
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-3xl font-bold text-slate-900">
                        {price.currency}
                        {price.price}
                      </span>
                      {!isLowest && (
                        <span className="text-sm text-red-600">
                          +€{(price.price - lowestPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => window.open(price.productUrl, '_blank')}
                    >
                      Buy at {store?.name}
                      <ExternalLink size={16} className="ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">Similar Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products
              .filter((p) => p.category === product.category && p.id !== product.id)
              .slice(0, 4)
              .map((p) => (
                <Card
                  key={p.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                  <CardContent className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {p.brand}
                    </Badge>
                    <h3 className="font-semibold mb-2 text-slate-900 line-clamp-2">
                      {p.name}
                    </h3>
                    <div className="text-xl font-bold text-slate-900">
                      €{Math.min(...p.prices.map((price) => price.price))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
