import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useState, useMemo } from 'react';
import { products, brands, categories, stores } from '../data/mockData';
import { ProductCard } from './ProductCard';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserMenu } from './UserMenu';

export function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [selectedStores, setSelectedStores] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<string>('price-low');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const toggleStore = (storeId: string) => {
    setSelectedStores((prev) =>
      prev.includes(storeId) ? prev.filter((s) => s !== storeId) : [...prev, storeId]
    );
  };

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (queryParam) {
      const query = queryParam.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brand.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter((p) => selectedBrands.includes(p.brand));
    }

    // Filter by stores
    if (selectedStores.length > 0) {
      filtered = filtered.filter((p) =>
        p.prices.some((price) => selectedStores.includes(price.storeId))
      );
    }

    // Filter by price range
    filtered = filtered.filter((p) => {
      const lowestPrice = Math.min(...p.prices.map((price) => price.price));
      return lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
    });

    // Sort products
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => {
        const aLowest = Math.min(...a.prices.map((p) => p.price));
        const bLowest = Math.min(...b.prices.map((p) => p.price));
        return aLowest - bLowest;
      });
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => {
        const aLowest = Math.min(...a.prices.map((p) => p.price));
        const bLowest = Math.min(...b.prices.map((p) => p.price));
        return bLowest - aLowest;
      });
    } else if (sortBy === 'brand') {
      filtered.sort((a, b) => a.brand.localeCompare(b.brand));
    }

    return filtered;
  }, [queryParam, selectedCategory, selectedBrands, selectedStores, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategory('All');
    setSelectedStores([]);
    setPriceRange([0, 500]);
  };

  const activeFiltersCount =
    selectedBrands.length +
    selectedStores.length +
    (selectedCategory !== 'All' ? 1 : 0);

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <h4 className="font-semibold mb-3 text-slate-900">Category</h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === category}
                onChange={() => setSelectedCategory(category)}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-slate-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div>
        <h4 className="font-semibold mb-3 text-slate-900">Brand</h4>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
              />
              <Label htmlFor={`brand-${brand}`} className="text-slate-700 cursor-pointer">
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Store Filter */}
      <div>
        <h4 className="font-semibold mb-3 text-slate-900">Store</h4>
        <div className="space-y-2">
          {stores.map((store) => (
            <div key={store.id} className="flex items-center gap-2">
              <Checkbox
                id={`store-${store.id}`}
                checked={selectedStores.includes(store.id)}
                onCheckedChange={() => toggleStore(store.id)}
              />
              <Label htmlFor={`store-${store.id}`} className="text-slate-700 cursor-pointer">
                {store.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-semibold mb-3 text-slate-900">Price Range</h4>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              className="w-24"
              placeholder="Min"
            />
            <span className="self-center text-slate-600">-</span>
            <Input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
              className="w-24"
              placeholder="Max"
            />
          </div>
        </div>
      </div>

      <Button onClick={clearFilters} variant="outline" className="w-full">
        Clear All Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <h1
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer"
              onClick={() => navigate('/')}
            >
              AllInOne Shop
            </h1>
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4"
                />
              </div>
            </form>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg text-slate-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <span className="text-sm text-blue-600">
                    {activeFiltersCount} active
                  </span>
                )}
              </div>
              <FiltersContent />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="bg-white rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-bold text-xl text-slate-900">
                    {queryParam ? `Results for "${queryParam}"` : 'All Products'}
                  </h2>
                  <p className="text-slate-600">{filteredProducts.length} products found</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="md:hidden flex-1 sm:flex-none">
                        <SlidersHorizontal size={16} className="mr-2" />
                        Filters
                        {activeFiltersCount > 0 && (
                          <span className="ml-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                      <SheetHeader>
                        <SheetTitle>Filters</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersContent />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="brand">Brand A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedBrands.map((brand) => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                  >
                    {brand}
                    <X size={14} />
                  </button>
                ))}
                {selectedStores.map((storeId) => {
                  const store = stores.find((s) => s.id === storeId);
                  return (
                    <button
                      key={storeId}
                      onClick={() => toggleStore(storeId)}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                    >
                      {store?.name}
                      <X size={14} />
                    </button>
                  );
                })}
                {selectedCategory !== 'All' && (
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                  >
                    {selectedCategory}
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <p className="text-lg text-slate-600">No products found matching your criteria</p>
                <Button onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
