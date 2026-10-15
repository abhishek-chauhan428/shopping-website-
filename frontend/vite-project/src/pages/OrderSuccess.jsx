import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../axiosCalls/axios'
import { formatPrice, getErrorMessage } from '../utils/helpers'

const OrderSuccess = () => {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get(`/orders/${id}`)
        setOrder(response.data.order)
      } catch (err) {
        setError(getErrorMessage(err, 'Unable to load the order.'))
      }
    }
    load()
  }, [id])

  if (error) return <div className="max-w-2xl mx-auto mt-16 p-8 text-center text-red-600">{error}</div>
  if (!order) return <p className="text-center text-slate-500 mt-10">Loading order...</p>

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md border border-slate-200 text-center">
      <div className="text-5xl mb-4">✅</div>
      <h1 className="text-3xl font-bold text-green-700 mb-3">Order Placed Successfully</h1>
      <p className="text-slate-600 mb-6">Your payment was verified and your order has been saved.</p>
      <div className="text-left bg-slate-50 rounded-md p-5 space-y-2 mb-6">
        <div className="flex justify-between gap-4"><span className="text-slate-500">Order ID</span><span className="font-medium text-slate-800 break-all">{order._id}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Total</span><span className="font-semibold text-slate-800">{formatPrice(order.totalAmount)}</span></div>
        <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-semibold text-green-700">{order.status}</span></div>
      </div>
      <div className="flex justify-center gap-3">
        <Link to="/orders" className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">View My Orders</Link>
        <Link to="/products" className="px-5 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold rounded-md">Continue Shopping</Link>
      </div>
    </div>
  )
}

export default OrderSuccess
