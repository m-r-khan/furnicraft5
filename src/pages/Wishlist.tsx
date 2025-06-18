import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { wishlist, removeFromWishlist, clearWishlist, getWishlistCount } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart(productId, 1);
      toast.success('Item added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId);
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      clearWishlist();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Please Login</h1>
            <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist.</p>
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft size={20} />
          </Button>
          <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          <Badge variant="secondary" className="ml-2">
            {getWishlistCount()} items
          </Badge>
        </div>
        
        {wishlist.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">Start adding products to your wishlist to save them for later.</p>
            <Button onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {getWishlistCount()} item{getWishlistCount() !== 1 ? 's' : ''} in your wishlist
              </p>
              <Button 
                variant="outline" 
                onClick={handleClearWishlist}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                Clear Wishlist
              </Button>
            </div>

            {/* Wishlist Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => (
                <Card key={item.id} className="card-elevated glass hover:shadow-xl transition-all duration-200">
                  <CardHeader className="p-4">
                    <div className="aspect-square bg-white rounded-lg overflow-hidden mb-4">
                      <img 
                        src={item.product?.image || '/placeholder.svg'} 
                        alt={item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {item.product?.name}
                    </CardTitle>
                    <p className="text-gray-600 text-sm">
                      {item.product?.shortDescription}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-emerald-700">
                        ₹{item.product?.price?.toLocaleString() || '0'}
                      </div>
                      {item.product?.originalPrice && item.product.originalPrice > item.product.price && (
                        <Badge className="bg-red-500 text-white">
                          -{Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}%
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(item.productId)}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800"
                        disabled={!item.product || item.product.stockQuantity <= 0}
                      >
                        <ShoppingCart size={16} className="mr-2" />
                        {item.product && item.product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRemoveFromWishlist(item.productId)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                    
                    {item.product && item.product.stockQuantity <= 0 && (
                      <p className="text-red-600 text-sm mt-2 text-center">
                        Currently out of stock
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Wishlist; 