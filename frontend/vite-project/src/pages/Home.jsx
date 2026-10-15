import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md border border-slate-200">
      <h2 className="text-3xl font-bold text-slate-800 mb-4">Welcome back, {user.fullName}!</h2>
      <div className="space-y-3 bg-slate-50 p-6 rounded-md border border-slate-200 mb-6">
        <p className="text-slate-700"><span className="font-semibold">Full Name:</span> {user.fullName}</p>
        <p className="text-slate-700"><span className="font-semibold">Email:</span> {user.email}</p>
        <p className="text-slate-700"><span className="font-semibold">Phone:</span> {user.phone}</p>
      </div>
      <Link
        to="/products"
        className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-150"
      >
        Browse Products
      </Link>
    </div>
  );
};

export default Home;
