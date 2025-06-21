import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 sm:py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-emerald-400">FurniCraft</h3>
            <p className="text-sm sm:text-base text-gray-300">
              Your trusted partner for premium quality furniture that transforms spaces into beautiful homes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-emerald-400 transition-colors text-sm sm:text-base">Home</a></li>
              <li><a href="/products" className="hover:text-emerald-400 transition-colors text-sm sm:text-base">Products</a></li>
              <li><a href="/cart" className="hover:text-emerald-400 transition-colors text-sm sm:text-base">Cart</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="text-sm sm:text-base">Living Room</li>
              <li className="text-sm sm:text-base">Bedroom</li>
              <li className="text-sm sm:text-base">Dining Room</li>
              <li className="text-sm sm:text-base">Office</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="text-sm sm:text-base">📞 +91 98765 43210</li>
              <li className="text-sm sm:text-base">✉️ info@furnicraft.com</li>
              <li className="text-sm sm:text-base">📍 Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-300">
          <p className="text-sm sm:text-base">&copy; 2024 FurniCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
