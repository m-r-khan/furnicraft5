import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeSampleData } from './utils/initializeData'

// Clear all localStorage data for fresh start
// if (typeof window !== 'undefined') {
//   localStorage.removeItem('furnicraft_user');
//   localStorage.removeItem('furnicraft_profile');
//   localStorage.removeItem('furnicraft_cart');
//   localStorage.removeItem('furnicraft_dynamic_users');
//   localStorage.removeItem('furnicraft_dynamic_profiles');
//   localStorage.removeItem('furnicraft_dynamic_passwords');
// }

// Initialize sample data
initializeSampleData();

try {
  const rootElement = document.getElementById("root");
  
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  const root = createRoot(rootElement);
  root.render(<App />);
} catch (error) {
  console.error('Error in main.tsx:', error);
}
