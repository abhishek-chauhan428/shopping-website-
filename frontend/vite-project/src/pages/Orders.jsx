import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../axiosCalls/axios'
import { formatPrice, getErrorMessage } from '../utils/helpers'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/orders')
      setOrders(response.data?.orders || [])
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to load your orders.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  if (loading) return <p className="text-center text-slate-500 mt-10">Loading your orders...</p>

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 text-center">
        <p className="text-lg font-semibold text-slate-800 mb-4">Unable to load your orders.</p>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={loadOrders} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Try Again</button>
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">My Orders</h1>
        <p className="text-slate-600 mb-6">You have not placed any orders yet.</p>
        <Link to="/products" className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Start Shopping</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4 pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">My Orders</h1>
      <div className="space-y-5">
        {orders.map(order => (
          <article key={order._id} className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
              <div>
                <h2 className="font-semibold text-slate-800">Order #{order._id}</h2>
                <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold w-fit">{order.status}</span>
            </div>
            <div className="space-y-2 mb-5">
              {order.items.map((item, index) => (
                <div key={`${order._id}-${item.product}-${index}`} className="flex justify-between gap-4 text-sm text-slate-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-slate-200 pt-4">
              <p className="font-bold text-slate-900">Total: {formatPrice(order.totalAmount)}</p>
              <Link to={`/orders/${order._id}`} className="text-blue-600 hover:underline font-medium">View Details</Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

export default Orders
