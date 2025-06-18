import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Star, Heart, Share2, Truck, Shield, Clock, Minus, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { Product } from '../types';
import { trackProductView, trackCartAddition, trackWishlistAddition } from '../utils/orderUtils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, isLoading: cartLoading, cart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist, isLoading: wishlistLoading } = useWishlist();
  const { 
    fetchProduct, 
    fetchProductReviews, 
    addProductReview,
    getProductsByCategory,
    fetchProductBySlug
  } = useProducts();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setIsLoading(true);
      try {
        // Try to find product by ID first, then by slug
        let productData = await fetchProduct(id);
        
        if (!productData) {
          // If not found by ID, try by slug
          productData = await fetchProductBySlug(id);
        }
        
        if (productData) {
          setProduct(productData);
          
          // Track product view
          trackProductView(productData.id);
          
          // Load reviews
          try {
            const reviewsData = await fetchProductReviews(productData.id);
            setReviews(reviewsData || []);
          } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
          }
          
          // Load related products
          if (productData.categoryId) {
            const related = getProductsByCategory(productData.categoryId)
              .filter(p => p.id !== productData.id)
              .slice(0, 4);
            setRelatedProducts(related);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        toast.error('Failed to load product details');
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]); // Only depend on id, not the functions

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
      trackCartAddition(product.id);
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    try {
      if (isInWishlist(product.id)) {
        removeFromWishlist(product.id);
        toast.success(`${product.name} removed from wishlist`);
        trackWishlistAddition(product.id);
      } else {
        await addToWishlist(product.id);
        toast.success(`${product.name} added to wishlist!`);
        trackWishlistAddition(product.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 1)) {
      setQuantity(newQuantity);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const isInStock = product?.stockQuantity ? product.stockQuantity > 0 : false;
  const hasDiscount = product?.originalPrice && product.originalPrice > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Use product images or fallback to placeholder
  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : product?.image 
      ? [product.image]
      : ['/placeholder.svg'];

  const isInCart = cart.items.some(item => item.productId === product?.id);
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    
    try {
      await addProductReview(product.id, {
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment
      });
      
      // Reload reviews
      const reviewsData = await fetchProductReviews(product.id);
      setReviews(reviewsData || []);
      
      // Reset form
      setReviewForm({
        rating: 5,
        title: '',
        comment: ''
      });
      setShowReviewForm(false);
      
      toast.success('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-300 h-8 w-32 rounded mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="bg-gray-300 h-96 rounded-lg"></div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-300 h-20 w-20 rounded"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-300 h-8 rounded"></div>
                <div className="bg-gray-300 h-4 rounded w-3/4"></div>
                <div className="bg-gray-300 h-6 rounded w-1/4"></div>
                <div className="bg-gray-300 h-20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist.</p>
            <Button onClick={handleGoBack} variant="outline">
              Go Back
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
        <Button
          onClick={handleGoBack}
          variant="ghost"
          className="flex items-center space-x-2 text-gray-600 hover:text-emerald-700 mb-8"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-lg shadow-md overflow-hidden">
              <img 
                src={productImages[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-emerald-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500">
              Home / Products / {product.category?.name || 'Category'} / {product.name}
            </div>

            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={20}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-gray-600">(4.5)</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{reviews.length} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-emerald-700">
                ₹{product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.originalPrice!.toLocaleString()}
                  </span>
                  <Badge className="bg-red-500 text-white text-lg px-3 py-1">
                    -{discountPercentage}%
                  </Badge>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <span className="text-emerald-600 font-medium">
                  In Stock ({product.stockQuantity} available)
                </span>
              ) : (
                <span className="text-red-600 font-medium">Out of Stock</span>
              )}
            </div>

            {/* Short Description */}
            <p className="text-gray-600">{product.shortDescription}</p>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity - 1)}
                  disabled={quantity <= 1}
                  className="px-3"
                >
                  <Minus size={16} />
                </Button>
                <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleQuantityChange(quantity + 1)}
                  disabled={quantity >= (product.stockQuantity || 1)}
                  className="px-3"
                >
                  <Plus size={16} />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isInCart ? (
                <Button
                  onClick={() => navigate('/cart')}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                  size="lg"
                >
                  Go to Cart
                </Button>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  disabled={!isInStock || cartLoading}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white"
                  size="lg"
                >
                  {cartLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adding...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <ShoppingCart size={20} />
                      {isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </div>
                  )}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={isWishlisted ? 'text-red-600 border-red-600 hover:bg-red-50' : ''}
              >
                <Heart 
                  size={20} 
                  className={isWishlisted ? 'fill-current' : ''}
                />
              </Button>
              
              <Button variant="outline" size="lg">
                <Share2 size={20} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="text-emerald-600" size={20} />
                <div>
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-sm text-gray-500">On orders over ₹5000</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="text-emerald-600" size={20} />
                <div>
                  <div className="font-medium">Warranty</div>
                  <div className="text-sm text-gray-500">2 years warranty</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock className="text-emerald-600" size={20} />
                <div>
                  <div className="font-medium">Fast Delivery</div>
                  <div className="text-sm text-gray-500">3-5 business days</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="text-emerald-600" size={20} />
                <div>
                  <div className="font-medium">Secure Payment</div>
                  <div className="text-sm text-gray-500">100% secure checkout</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mb-12">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-2 border-b">
                        <span className="font-medium text-gray-700">{key}</span>
                        <span className="text-gray-600">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {/* Review Form */}
                  {user && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Write a Review</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowReviewForm(!showReviewForm)}
                        >
                          {showReviewForm ? 'Cancel' : 'Add Review'}
                        </Button>
                      </div>
                      
                      {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">Rating</label>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                                  className="text-2xl"
                                >
                                  <Star
                                    className={star <= reviewForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Title (optional)</label>
                            <input
                              type="text"
                              value={reviewForm.title}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, title: e.target.value }))}
                              className="w-full p-2 border rounded-md"
                              placeholder="Brief summary of your experience"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Comment *</label>
                            <textarea
                              value={reviewForm.comment}
                              onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                              className="w-full p-2 border rounded-md"
                              rows={3}
                              placeholder="Share your experience with this product..."
                              required
                            />
                          </div>
                          
                          <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800">
                            Submit Review
                          </Button>
                        </form>
                      )}
                    </div>
                  )}
                  
                  {/* Reviews List */}
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, index) => (
                        <div key={index} className="border-b pb-4 last:border-b-0">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={16}
                                  className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.user?.name || 'Anonymous'}</span>
                            <span className="text-gray-500 text-sm">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-gray-800 mb-1">{review.title}</h4>
                          )}
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
