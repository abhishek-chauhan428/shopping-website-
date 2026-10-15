import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';

const ProductCard = ({ product }) => {
  const { addToCart, getQuantity, isPending } = useCart();
  const { isInWishlist, addToWishlist } = useWishlist();

  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');
  const [wishlistSaving, setWishlistSaving] = useState(false);
  const [wishlistError, setWishlistError] = useState('');

  const adding = isPending(product._id);
  const inCartQty = getQuantity(product._id);
  const outOfStock = product.stock === 0;
  const maxedOut = inCartQty >= product.stock && !outOfStock;
  const saved = isInWishlist(product._id);

  // Auto-hide error messages
  useEffect(() => {
    if (!cartError) return;
    const t = setTimeout(() => setCartError(''), 4000);
    return () => clearTimeout(t);
  }, [cartError]);

  useEffect(() => {
    if (!wishlistError) return;
    const t = setTimeout(() => setWishlistError(''), 4000);
    return () => clearTimeout(t);
  }, [wishlistError]);

  const handleAdd = async () => {
    setCartError('');
    try {
      await addToCart(product._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (error) {
      setCartError(error.message);
    }
  };

  const handleWishlist = async () => {
    if (wishlistSaving || saved) return;
    setWishlistSaving(true);
    setWishlistError('');
    try {
      await addToWishlist(product);
    } catch (error) {
      setWishlistError(error.message || 'Unable to save product. Please try again.');
    } finally {
      setWishlistSaving(false);
    }
  };

  let cartLabel = 'Add to Cart';
  if (outOfStock) cartLabel = 'Out of Stock';
  else if (adding) cartLabel = 'Adding...';
  else if (added) cartLabel = 'Added ✓';
  else if (maxedOut) cartLabel = 'Max in Cart';
  else if (inCartQty > 0) cartLabel = 'Add Another';

  const wishlistLabel = wishlistSaving ? '⏳ Saving...' : saved ? '♥ Added to Wishlist' : '♡ Add to Wishlist';

  return (
    <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-44 object-cover bg-slate-100"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x300?text=No+Image'; }}
      />
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">{product.category}</span>
        <h3 className="text-lg font-bold text-slate-800 mb-1">{product.name}</h3>
        <p className="text-sm text-slate-600 mb-2 flex-1 line-clamp-2">{product.description}</p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-slate-900">{formatPrice(product.price)}</span>
          <span className={`text-xs font-medium ${outOfStock ? 'text-red-600' : 'text-slate-500'}`}>
            {outOfStock ? 'Out of stock' : `${product.stock} units left`}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <Link
              to={`/products/${product._id}`}
              className="flex-1 text-center px-4 py-2 rounded-md text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition duration-150"
            >
              View Details
            </Link>
            <button
              onClick={handleAdd}
              disabled={adding || outOfStock || maxedOut}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition duration-150 ${
                outOfStock || maxedOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : added
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-70'
              }`}
            >
              {cartLabel}
            </button>
          </div>

          {cartError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">
              {cartError}
            </p>
          )}

          <button
            onClick={handleWishlist}
            disabled={wishlistSaving || saved}
            className={`w-full px-4 py-2 rounded-md text-sm font-semibold border transition duration-150 ${
              saved
                ? 'bg-pink-50 border-pink-300 text-pink-600'
                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {wishlistLabel}
          </button>

          {wishlistError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2 text-center">
              {wishlistError}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
