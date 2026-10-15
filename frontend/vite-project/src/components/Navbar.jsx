import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-slate-900 text-white shadow-md">
      <Link to={user ? '/home' : '/login'} className="text-xl font-bold tracking-tight">
        ShopKart
      </Link>

      {user && (
        <div className="flex items-center gap-6">
          <Link to="/home" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Home
          </Link>
          <Link to="/products" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Products
          </Link>
          <Link to="/wishlist" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Wishlist
          </Link>
          <Link to="/cart" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Cart ({cartCount})
          </Link>
          <Link to="/orders" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Orders
          </Link>
          <Link to="/profile" className="text-sm font-medium hover:text-blue-400 transition duration-150">
            Profile
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-md transition duration-150"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
