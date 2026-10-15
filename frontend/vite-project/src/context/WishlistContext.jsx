import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import api from '../axiosCalls/axios';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../utils/helpers';

const WishlistContext = createContext();

// Shared wishlist state, so product cards know what is already saved
// (and the Wishlist page reads the very same list).
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id;

  const [wishlist, setWishlist] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const refreshWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([]);
      setLoaded(false);
      setError('');
      return;
    }
    setFetching(true);
    setError('');
    try {
      const response = await api.get('/wishlist');
      setWishlist(response.data?.wishlist || []);
    } catch (err) {
      console.error('Fetch wishlist error:', err);
      setError("We couldn't load your wishlist.");
    } finally {
      setFetching(false);
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  const wishlistIds = useMemo(() => new Set(wishlist.map((p) => p._id)), [wishlist]);
  const isInWishlist = (productId) => wishlistIds.has(productId);

  const addToWishlist = async (product) => {
    try {
      await api.post(`/wishlist/${product._id}`);
    } catch (err) {
      // 409 = it is already saved on the server. That is the state the user wanted,
      // so treat it as success instead of showing a bogus error.
      if (err?.response?.status !== 409) {
        throw new Error(getErrorMessage(err, 'Unable to save product. Please try again.'));
      }
    }
    setWishlist((prev) => (prev.some((p) => p._id === product._id) ? prev : [...prev, product]));
  };

  const removeFromWishlist = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
    } catch (err) {
      // 404 = already gone on the server, which is what we wanted
      if (err?.response?.status !== 404) {
        throw new Error(getErrorMessage(err, 'Unable to remove product. Please try again.'));
      }
    }
    setWishlist((prev) => prev.filter((p) => p._id !== productId));
  };

  const loading = fetching || (!!userId && !loaded);

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, error, refreshWishlist, isInWishlist, addToWishlist, removeFromWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
