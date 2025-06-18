import React from 'react';
import Navbar from '../components/Navbar';
import ProductGrid from '../components/ProductGrid';
import Hero from '../components/Hero';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <Hero />
      {/* Current Offers Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="card-elevated glass p-6 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-emerald-700 mb-4 flex items-center gap-2">
            <span>🔥</span> Current Offers
          </h2>
          <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
            {/* Example Offer Cards */}
            <div className="min-w-[320px] bg-gradient-to-br from-emerald-100 via-white to-blue-100 rounded-2xl shadow-lg p-6 flex flex-col justify-between items-start relative card-elevated">
              <span className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">Deal of the Day</span>
              <h3 className="text-xl font-bold mb-2">Upto 60% Off on Sofas</h3>
              <p className="text-gray-600 mb-4">Upgrade your living room with our best-selling sofas. Limited time only!</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-yellow-400 text-white text-xs px-2 py-1 rounded">Hurry!</span>
                <span className="text-xs text-gray-500">Ends in <span className="font-semibold">12:34:56</span></span>
              </div>
              <Link to="/products" className="mt-auto bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-lg font-semibold shadow transition-all">Shop Now</Link>
            </div>
            <div className="min-w-[320px] bg-gradient-to-br from-pink-100 via-white to-yellow-100 rounded-2xl shadow-lg p-6 flex flex-col justify-between items-start relative card-elevated">
              <span className="absolute top-4 right-4 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">Festive Offer</span>
              <h3 className="text-xl font-bold mb-2">Buy 1 Get 1 Free: Dining Chairs</h3>
              <p className="text-gray-600 mb-4">Perfect for family gatherings. Add 2 to cart, pay for 1!</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-400 text-white text-xs px-2 py-1 rounded">BOGO</span>
                <span className="text-xs text-gray-500">While stocks last</span>
              </div>
              <Link to="/products" className="mt-auto bg-pink-600 hover:bg-pink-700 text-white px-5 py-2 rounded-lg font-semibold shadow transition-all">Shop Now</Link>
            </div>
            <div className="min-w-[320px] bg-gradient-to-br from-yellow-100 via-white to-orange-100 rounded-2xl shadow-lg p-6 flex flex-col justify-between items-start relative card-elevated">
              <span className="absolute top-4 right-4 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow">Limited Time</span>
              <h3 className="text-xl font-bold mb-2">Extra 20% Off on Beds</h3>
              <p className="text-gray-600 mb-4">Sleep better with our premium beds. Use code <span className="font-semibold">SLEEP20</span>.</p>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-400 text-white text-xs px-2 py-1 rounded">Code: SLEEP20</span>
              </div>
              <Link to="/products" className="mt-auto bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-semibold shadow transition-all">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>
      <main className="container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
