import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../axiosCalls/axios';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/helpers';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart, getQuantity, isPending } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);
  const [cartError, setCartError] = useState('');

  const fetchProduct = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/products/${id}`);
      setProduct(response.data?.product || null);
    } catch (err) {
      setError('Something went wrong while loading this product.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();

  }, [id]);

  const handleAdd = async () => {
    setCartError('');
    try {
      await addToCart(product._id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1200);
    } catch (err) {
      setCartError(err.message);
    }
  };

  if (loading) {
    return <p className="max-w-4xl mx-auto mt-10 p-4 text-slate-500">Loading product...</p>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <p className="text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</p>
        <Link to="/products" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <p className="text-slate-500">Product not found.</p>
        <Link to="/products" className="inline-block mt-4 text-blue-600 hover:underline">
          ← Back to Products
        </Link>
      </div>
    );
  }

  const adding = isPending(product._id);
  const inCartQty = getQuantity(product._id);
  const outOfStock = product.stock === 0;
  const maxedOut = inCartQty >= product.stock && !outOfStock;

  let cartLabel = 'Add to Cart';
  if (outOfStock) cartLabel = 'Out of Stock';
  else if (adding) cartLabel = 'Adding...';
  else if (added) cartLabel = 'Added ✓';
  else if (maxedOut) cartLabel = 'Max in Cart';
  else if (inCartQty > 0) cartLabel = 'Add Another';

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <Link to="/products" className="inline-block mb-6 text-sm text-blue-600 hover:underline">
        ← Back to Products
      </Link>

      <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden flex flex-col md:flex-row">
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-80 object-cover bg-slate-100"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/600x400?text=No+Image'; }}
        />

        <div className="p-6 flex flex-col flex-1">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">{product.category}</span>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">{product.name}</h1>
          <p className="text-slate-600 mb-4">{product.description}</p>

          <div className="text-3xl font-bold text-slate-900 mb-2">{formatPrice(product.price)}</div>
          <p className={`text-sm font-medium mb-6 ${product.stock === 0 ? 'text-red-600' : 'text-slate-500'}`}>
            {product.stock === 0 ? 'Out of stock' : `${product.stock} units left`}
          </p>

          <button
            onClick={handleAdd}
            disabled={adding || outOfStock || maxedOut}
            className={`mt-auto w-full md:w-auto px-6 py-3 rounded-md text-sm font-semibold transition duration-150 ${
              outOfStock || maxedOut
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {cartLabel}
          </button>
          {cartError && <p className="mt-3 text-sm text-red-600">{cartError}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
