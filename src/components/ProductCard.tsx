import React from 'react';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { Product } from '../types';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { trackProductView, trackCartAddition, trackWishlistAddition } from '../utils/orderUtils';

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
}

const ProductCard = ({ product, showActions = true }: ProductCardProps) => {
  const { addToCart, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  const navigate = useNavigate();
  const [adding, setAdding] = React.useState(false);

  // Track product view when component mounts
  React.useEffect(() => {
    trackProductView(product.id);
  }, [product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAdding(true);
    try {
      await addToCart(product.id, 1);
      trackCartAddition(product.id);
      toast.success('Added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        trackWishlistAddition(product.id);
        toast.success('Added to wishlist!');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error('Failed to update wishlist');
    }
  };

  const handleCardClick = () => {
    navigate(`/product/${product.slug || product.id}`);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.slug || product.id}`);
  };

  const isInStock = product.stockQuantity > 0;
  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const isInCart = cart.items.some(item => item.productId === product.id);
  const isWishlisted = isInWishlist(product.id);

  return (
    <Card 
      className="group card-elevated glass hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/80 backdrop-blur-sm border border-emerald-100"
      onClick={handleCardClick}
    >
      <CardHeader className="p-4 relative">
        <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4 relative">
          <img 
            src={product.image || '/placeholder.svg'} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
          
          {showActions && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleQuickView}
                  className="bg-white/80 text-gray-800 hover:bg-gray-100 shadow"
                >
                  <Eye size={16} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`bg-white/80 text-gray-800 hover:bg-gray-100 shadow ${
                    isWishlisted ? 'text-red-500 hover:text-red-600' : ''
                  }`}
                >
                  <Heart 
                    size={16} 
                    className={isWishlisted ? 'fill-current' : ''}
                  />
                </Button>
              </div>
            </div>
          )}
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.isFeatured && (
              <Badge className="bg-emerald-600 text-white shadow">Featured</Badge>
            )}
            {hasDiscount && (
              <Badge className="bg-red-500 text-white shadow">-{discountPercentage}%</Badge>
            )}
            {!isInStock && (
              <Badge className="bg-red-100 text-red-800 shadow">Out of Stock</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-800 group-hover:text-emerald-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>
          
          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={14}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">(4.5)</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-emerald-700">
              ₹{product.price.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ₹{product.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="p-4 pt-0 bg-white/90 border-t border-emerald-50">
          {isInCart ? (
            <Button
              onClick={e => { e.stopPropagation(); navigate('/cart'); }}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
              size="sm"
            >
              Go to Cart
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={!isInStock || adding}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg"
              size="sm"
            >
              {adding ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Adding...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <ShoppingCart size={16} />
                  {isInStock ? 'Add to Cart' : 'Out of Stock'}
                </div>
              )}
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default ProductCard;
