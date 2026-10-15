import React, { createContext, useState, useEffect, useContext, useCallback, useMemo } from 'react';
import api from '../axiosCalls/axios';
import { useAuth } from './AuthContext';
import { getErrorMessage } from '../utils/helpers';

const CartContext = createContext();


export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id;

  const [cartItems, setCartItems] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');

  const [pendingIds, setPendingIds] = useState([]);

  const refreshCart = useCallback(async () => {
    if (!userId) {
      setCartItems([]);
      setLoaded(false);
      setError('');
      return;
    }
    setFetching(true);
    setError('');
    try {
      const response = await api.get('/cart');
      setCartItems(response.data?.cart || []);
    } catch (err) {
      console.error('Fetch cart error:', err);
      setError(getErrorMessage(err, 'Unable to load your cart.'));
    } finally {
      setFetching(false);
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const setPending = (productId, isPending) =>
    setPendingIds((prev) =>
      isPending ? [...prev, productId] : prev.filter((id) => id !== productId)
    );

  const mutate = async (productId, request) => {
    setPending(productId, true);
    try {
      const response = await request();
      setCartItems(response.data?.cart || []);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    } finally {
      setPending(productId, false);
    }
  };

  const addToCart = (productId) => mutate(productId, () => api.post(`/cart/${productId}`));

  const updateQuantity = (productId, quantity) =>
    mutate(productId, () => api.patch(`/cart/${productId}`, { quantity }));

  const removeFromCart = (productId) => mutate(productId, () => api.delete(`/cart/${productId}`));

  const clearCart = async () => {
    try {
      await api.delete('/cart/clear');
      setCartItems([]);
    } catch (err) {
      throw new Error(getErrorMessage(err));
    }
  };

  const resetCartState = () => setCartItems([]);

  const isPending = (productId) => pendingIds.includes(productId);

  const getQuantity = (productId) =>
    cartItems.find((item) => item.product?._id === productId)?.quantity || 0;


  const { cartCount, subtotal } = useMemo(
    () => ({
      cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    }),
    [cartItems]
  );

  const loading = fetching || (!!userId && !loaded);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        error,
        refreshCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        resetCartState,
        isPending,
        getQuantity,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
