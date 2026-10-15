import React, { useEffect, useState, useCallback } from 'react';
import api from '../axiosCalls/axios';
import ProductCard from '../components/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/products/categories');
      setCategories(['All', ...(response.data?.categories || [])]);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const response = await api.get('/products', { params });
      setProducts(response.data?.products || []);
    } catch (err) {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300); // debounce search typing
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h2 className="text-3xl font-bold text-slate-800 mb-6">Shop Products</h2>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {error && <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded border border-red-300">{error}</div>}

      {loading ? (
        <p className="text-slate-500">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="text-slate-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Products;
