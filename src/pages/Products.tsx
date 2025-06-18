import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductGrid from '../components/ProductGrid';

const Products = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Our Products</h1>
        
        {/* Use the enhanced ProductGrid component */}
        <ProductGrid 
          showFilters={true}
          showSearch={true}
          showPagination={true}
          itemsPerPage={12}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
