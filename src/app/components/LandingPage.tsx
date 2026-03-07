import { Search } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useState } from 'react';
import { products } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { UserMenu } from './UserMenu';

export function LandingPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const trendingItems = products.slice(0, 3);
  const categories = [
    { name: 'Men', icon: '👔' },
    { name: 'Women', icon: '👗' },
    { name: 'Sneakers', icon: '👟' },
    { name: 'Hoodies', icon: '🧥' },
    { name: 'Jackets', icon: '🧥' },
    { name: 'Pants', icon: '👖' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AllInOne Shop
            </h1>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                Categories
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                Brands
              </a>
              <a href="#" className="text-slate-600 hover:text-slate-900 transition-colors">
                Deals
              </a>
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
            Find the Best Deals on Fashion
          </h2>
          <p className="text-lg text-slate-600 mb-8">
            Compare prices from multiple stores and save on your favorite brands
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={24} />
              <Input
                type="text"
                placeholder="Search for products, brands, or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-6 text-lg rounded-full border-2 border-slate-200 focus:border-blue-500 shadow-lg"
              />
              <Button
                type="submit"
                className="absolute right-2 rounded-full px-8 py-5 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Trending Items */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-6 text-slate-900">Trending Now</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {trendingItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-12">
        <h3 className="text-2xl font-bold mb-6 text-slate-900">Shop by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              onClick={() => navigate(`/search?category=${encodeURIComponent(category.name)}`)}
              className="bg-white border-2 border-slate-200 rounded-xl p-6 hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-slate-900">{category.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-12 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🔍</div>
            <h4 className="font-bold text-lg mb-2 text-slate-900">Compare Prices</h4>
            <p className="text-slate-600">
              Find the best deals from multiple stores in one place
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h4 className="font-bold text-lg mb-2 text-slate-900">Fast & Easy</h4>
            <p className="text-slate-600">
              Quick search results with direct links to purchase
            </p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="font-bold text-lg mb-2 text-slate-900">Save Money</h4>
            <p className="text-slate-600">
              Always get the lowest price available online
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
