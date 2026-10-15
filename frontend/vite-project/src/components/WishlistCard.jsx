import React from 'react';
import { Link } from 'react-router-dom';

const WishlistCard = ({ product, onRemove, removing }) => {
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

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-slate-900">₹{product.price}</span>
          <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <Link
            to={`/products/${product._id}`}
            className="text-center px-4 py-2 rounded-md text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition duration-150"
          >
            View Details
          </Link>
          <button
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="px-4 py-2 rounded-md text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition duration-150 disabled:opacity-60"
          >
            {removing ? 'Removing...' : 'Remove ♥'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WishlistCard;
