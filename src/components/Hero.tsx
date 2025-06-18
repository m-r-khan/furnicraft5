import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-stone-100 to-stone-200 py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
          Beautiful Furniture for
          <span className="text-emerald-700 block">Modern Living</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover our curated collection of premium furniture pieces that blend style, 
          comfort, and functionality for your perfect home.
        </p>
        <Link
          to="/products"
          className="inline-block bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-800 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    </section>
  );
};

export default Hero;
