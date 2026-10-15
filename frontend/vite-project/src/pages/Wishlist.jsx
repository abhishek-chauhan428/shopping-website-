import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import WishlistCard from '../components/WishlistCard';

const Wishlist = () => {
  const { wishlist, loading, error, refreshWishlist, removeFromWishlist } = useWishlist();
  const [removingId, setRemovingId] = useState(null);

  const handleRemove = async (productId) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
    } catch (err) {
      console.error('Remove from wishlist error:', err);
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-4">
        <p className="text-slate-500">Loading your wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-4 text-center">
        <p className="text-lg font-semibold text-slate-800 mb-2">Something went wrong.</p>
        <p className="text-slate-600 mb-6">{error}</p>
        <button
          onClick={refreshWishlist}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="max-w-6xl mx-auto mt-10 p-4 text-center">
        <div className="text-5xl mb-4">❤️</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Your wishlist is empty</h2>
        <p className="text-slate-600 mb-6">Save products you love and find them here later.</p>
        <Link
          to="/products"
          className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-slate-800 mb-1">My Wishlist</h2>
      <p className="text-slate-500 mb-6">{wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {wishlist.map((product) => (
          <WishlistCard
            key={product._id}
            product={product}
            onRemove={handleRemove}
            removing={removingId === product._id}
          />
        ))}
      </div>
    </div>
  );
};

export default Wishlist;
