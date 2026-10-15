import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../axiosCalls/axios'
import { formatPrice, getErrorMessage } from '../utils/helpers'

const OrderDetails = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`)
        setOrder(response.data.order)
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load this order.'))
      }
    }
    loadOrder()
  }, [id])

  if (error) return <div className="max-w-2xl mx-auto mt-16 p-8 text-center text-red-600">{error}</div>
  if (!order) return <p className="text-center text-slate-500 mt-10">Loading order...</p>

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 pb-12">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Order Details</h1>
          <p className="text-sm text-slate-500 break-all">#{order._id}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">{order.status}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={`${item.product}-${index}`} className="flex gap-4 items-center border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-slate-100" />
                <div className="flex-1"><p className="font-medium text-slate-800">{item.name}</p><p className="text-sm text-slate-500">{formatPrice(item.price)} × {item.quantity}</p></div>
                <p className="font-semibold text-slate-800">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>
        <aside className="space-y-6">
          <section className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Shipping</h2>
            <div className="text-sm text-slate-600 space-y-1"><p>{order.shippingAddress.fullName}</p><p>{order.shippingAddress.phone}</p><p>{order.shippingAddress.addressLine1}</p><p>{order.shippingAddress.city}, {order.shippingAddress.state}</p><p>{order.shippingAddress.pincode}</p></div>
          </section>
          <section className="bg-white rounded-lg shadow-md border border-slate-200 p-6"><div className="flex justify-between font-bold text-slate-900"><span>Total</span><span>{formatPrice(order.totalAmount)}</span></div><div className="flex justify-between text-sm text-slate-600 mt-2"><span>Payment</span><span>{order.paymentStatus}</span></div></section>
        </aside>
      </div>
      <Link to="/orders" className="inline-block mt-6 text-blue-600 hover:underline font-medium">← Back to My Orders</Link>
    </div>
  )
}

export default OrderDetails
