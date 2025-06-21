import React, { useState, useEffect, useCallback } from 'react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from './ProductCard';
import { ProductFilters } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Badge } from './ui/badge';
import { Search, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ProductGridProps {
  showFilters?: boolean;
  showSearch?: boolean;
  showPagination?: boolean;
  itemsPerPage?: number;
  categoryId?: string;
  featuredOnly?: boolean;
}

const ProductGrid = ({ 
  showFilters = true, 
  showSearch = true, 
  showPagination = true,
  itemsPerPage = 12,
  categoryId,
  featuredOnly = false
}: ProductGridProps) => {
  const { 
    products, 
    categories, 
    isLoading, 
    error, 
    fetchProducts, 
    fetchCategories,
    sortProducts
  } = useProducts();

  const [filters, setFilters] = useState<ProductFilters>({
    category: categoryId,
    priceRange: { min: 0, max: 100000 },
    sortBy: 'name',
    sortOrder: 'asc',
    inStock: undefined
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: categoryId,
      priceRange: { min: 0, max: 100000 },
      sortBy: 'name',
      sortOrder: 'asc',
      inStock: undefined
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const getDisplayProducts = () => {
    let displayProducts = [...products]; // Create a copy to avoid mutating original
    
    // Apply category filter
    if (filters.category) {
      displayProducts = displayProducts.filter(product => product.categoryId === filters.category);
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      displayProducts = displayProducts.filter(product => 
        product.price >= filters.priceRange!.min && product.price <= filters.priceRange!.max
      );
    }
    
    // Apply stock filter
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        displayProducts = displayProducts.filter(product => product.stockQuantity > 0);
      } else {
        displayProducts = displayProducts.filter(product => product.stockQuantity === 0);
      }
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      displayProducts = displayProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.shortDescription?.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.category?.name.toLowerCase().includes(query)
      );
    }
    
    // Apply featured/category filters
    if (featuredOnly) {
      displayProducts = displayProducts.filter(product => product.isFeatured);
    } else if (categoryId) {
      displayProducts = displayProducts.filter(product => product.categoryId === categoryId);
    }
    
    // Apply sorting
    return sortProducts(displayProducts, filters.sortBy || 'name', filters.sortOrder || 'asc');
  };

  const displayProducts = getDisplayProducts();
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const paginatedProducts = displayProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg mb-4">Error loading products</div>
        <Button onClick={() => fetchProducts()} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Header */}
      {(showSearch || showFilters) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <span>Products ({displayProducts.length} found)</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className="text-xs sm:text-sm"
                >
                  <Filter size={16} className="mr-2" />
                  Filters
                </Button>
                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List size={16} />
                  </Button>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Search Bar */}
            {showSearch && (
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" className="w-full sm:w-auto">Search</Button>
              </form>
            )}

            {/* Filters Panel */}
            {showFilters && showFiltersPanel && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={filters.category || 'all'}
                    onValueChange={(value) => handleFilterChange('category', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Price Range</label>
                  <div className="space-y-2">
                    <Slider
                      value={[filters.priceRange?.min || 0, filters.priceRange?.max || 100000]}
                      onValueChange={(value) => handleFilterChange('priceRange', { min: value[0], max: value[1] })}
                      max={100000}
                      step={1000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>₹{filters.priceRange?.min?.toLocaleString()}</span>
                      <span>₹{filters.priceRange?.max?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Stock Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Stock Status</label>
                  <Select
                    value={filters.inStock === undefined ? 'all' : filters.inStock ? 'true' : 'false'}
                    onValueChange={(value) => handleFilterChange('inStock', value === 'all' ? undefined : value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">In Stock</SelectItem>
                      <SelectItem value="false">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort By */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <Select
                    value={filters.sortBy || 'name'}
                    onValueChange={(value) => handleFilterChange('sortBy', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price">Price</SelectItem>
                      <SelectItem value="createdAt">Newest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="text-sm font-medium mb-2 block">Order</label>
                  <Select
                    value={filters.sortOrder || 'asc'}
                    onValueChange={(value) => handleFilterChange('sortOrder', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Active Filters */}
            {showFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.category && (
                  <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => handleFilterChange('category', undefined)}>
                    Category: {categories.find(c => c.id === filters.category)?.name}
                    <span className="ml-1">×</span>
                  </Badge>
                )}
                {filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 100000) && (
                  <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => handleFilterChange('priceRange', { min: 0, max: 100000 })}>
                    Price: ₹{filters.priceRange.min.toLocaleString()} - ₹{filters.priceRange.max.toLocaleString()}
                    <span className="ml-1">×</span>
                  </Badge>
                )}
                {filters.inStock !== undefined && (
                  <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => handleFilterChange('inStock', undefined)}>
                    Stock: {filters.inStock ? 'In Stock' : 'Out of Stock'}
                    <span className="ml-1">×</span>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="cursor-pointer text-xs" onClick={() => setSearchQuery('')}>
                    Search: "{searchQuery}"
                    <span className="ml-1">×</span>
                  </Badge>
                )}
                {(filters.category || (filters.priceRange && (filters.priceRange.min > 0 || filters.priceRange.max < 100000)) || filters.inStock !== undefined || searchQuery) && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
                    Clear All
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
              <div className="bg-gray-300 h-48 rounded-lg mb-4"></div>
              <div className="bg-gray-300 h-4 rounded mb-2"></div>
              <div className="bg-gray-300 h-4 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && (
        <>
          <div className={`grid gap-4 sm:gap-6 ${
            viewMode === 'grid' 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
              : 'grid-cols-1'
          }`}>
            {paginatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {displayProducts.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {showPagination && totalPages > 1 && !isLoading && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto"
          >
            <ChevronLeft size={16} />
            Previous
          </Button>
          
          <div className="flex gap-1 flex-wrap justify-center">
            {[...Array(totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="text-xs sm:text-sm"
                >
                  {page}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto"
          >
            Next
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
