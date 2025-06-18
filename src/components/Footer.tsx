import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-emerald-400">FurniCraft</h3>
            <p className="text-gray-300">
              Your trusted partner for premium quality furniture that transforms spaces into beautiful homes.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/" className="hover:text-emerald-400 transition-colors">Home</a></li>
              <li><a href="/products" className="hover:text-emerald-400 transition-colors">Products</a></li>
              <li><a href="/cart" className="hover:text-emerald-400 transition-colors">Cart</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Living Room</li>
              <li>Bedroom</li>
              <li>Dining Room</li>
              <li>Office</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>📞 +91 98765 43210</li>
              <li>✉️ info@furnicraft.com</li>
              <li>📍 Mumbai, India</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; 2024 FurniCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
