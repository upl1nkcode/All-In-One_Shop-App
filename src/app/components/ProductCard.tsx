import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Product, stores } from '../data/mockData';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  // Find the lowest price
  const lowestPrice = Math.min(...product.prices.map((p) => p.price));
  const lowestPriceStore = product.prices.find((p) => p.price === lowestPrice);
  const store = stores.find((s) => s.id === lowestPriceStore?.storeId);

  return (
    <Card
      className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="aspect-square overflow-hidden bg-slate-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <Badge variant="secondary" className="mb-2">
          {product.brand}
        </Badge>
        <h3 className="font-semibold text-lg mb-2 text-slate-900 line-clamp-2">
          {product.name}
        </h3>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-slate-900">
              {lowestPriceStore?.currency}
              {lowestPrice}
            </div>
            <div className="text-sm text-slate-600">Lowest price</div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm font-medium text-slate-700">Available at:</div>
          {product.prices.slice(0, 3).map((price) => {
            const priceStore = stores.find((s) => s.id === price.storeId);
            return (
              <div
                key={price.storeId}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-slate-600">{priceStore?.name}</span>
                <span className="font-semibold text-slate-900">
                  {price.currency}
                  {price.price}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
