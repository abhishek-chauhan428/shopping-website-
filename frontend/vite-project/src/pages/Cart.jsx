import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const Cart = () => {
  const {
    cartItems,
    loading,
    error,
    refreshCart,
    updateQuantity,
    removeFromCart,
    isPending,
    cartCount,
    subtotal,
  } = useCart();
  const [itemErrors, setItemErrors] = useState({});
  const navigate = useNavigate();

  const setItemError = (productId, message) =>
    setItemErrors((prev) => ({ ...prev, [productId]: message }));

  const handleQuantityChange = async (productId, quantity) => {
    setItemError(productId, '');
    try {
      await updateQuantity(productId, quantity);
    } catch (err) {
      setItemError(productId, err.message);
    }
  };

  const handleRemove = async (productId) => {
    setItemError(productId, '');
    try {
      await removeFromCart(productId);
    } catch (err) {
      setItemError(productId, err.message);
    }
  };

  if (loading) {
    return <p className="text-center text-slate-500 mt-10">Loading your cart...</p>;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
        <p className="text-lg font-semibold text-slate-800 mb-4">Unable to load your cart.</p>
        <button onClick={refreshCart} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Try Again</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md border border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty 🛒</h2>
        <p className="text-slate-600 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/products" className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">My Cart</h2>
      <div className="bg-white rounded-lg shadow-md border border-slate-200 divide-y divide-slate-200">
        {cartItems.map((item) => {
          const { product, quantity } = item;
          const busy = isPending(product._id);
          const atMax = quantity >= product.stock;
          return (
            <div key={product._id} className={`p-4 ${busy ? 'opacity-60' : ''}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-md bg-slate-100" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://placehold.co/100x100?text=No+Image'; }} />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800">{product.name}</h3>
                  <p className="text-sm text-slate-500">{formatPrice(product.price)} each</p>
                  <p className="text-xs text-slate-400">{product.stock === 0 ? 'Out of stock' : `${product.stock} in stock`}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQuantityChange(product._id, quantity - 1)} disabled={busy || quantity <= 1} className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-slate-100 disabled:opacity-40">−</button>
                  <span className="w-8 text-center font-medium">{quantity}</span>
                  <button onClick={() => handleQuantityChange(product._id, quantity + 1)} disabled={busy || atMax} className="w-8 h-8 flex items-center justify-center border rounded-md hover:bg-slate-100 disabled:opacity-40">+</button>
                </div>
                <div className="w-28 text-right font-semibold text-slate-800">{formatPrice(product.price * quantity)}</div>
                <button onClick={() => handleRemove(product._id)} disabled={busy} className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50">{busy ? '...' : 'Remove'}</button>
              </div>
              {itemErrors[product._id] && <p className="mt-2 text-sm text-red-600">{itemErrors[product._id]}</p>}
            </div>
          );
        })}
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-md border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-3">Order Summary</h3>
        <div className="flex justify-between text-slate-600 mb-1"><span>Items</span><span>{cartCount}</span></div>
        <div className="flex justify-between items-center border-t border-slate-200 mt-3 pt-3"><span className="text-lg font-semibold text-slate-800">Subtotal</span><span className="text-2xl font-bold text-slate-900">{formatPrice(subtotal)}</span></div>
      </div>

      <div className="mt-4 flex justify-end">
        <button onClick={() => navigate('/checkout')} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Proceed to Checkout</button>
      </div>
    </div>
  );
};

export default Cart;
