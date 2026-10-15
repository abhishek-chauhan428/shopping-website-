import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatPrice, getErrorMessage } from '../utils/helpers'
import api from '../axiosCalls/axios'

const initialForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: ''
}

const Checkout = () => {
  const { cartItems, loading, subtotal, resetCartState } = useCart()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [placingOrder, setPlacingOrder] = useState(false)
  const navigate = useNavigate()

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0),
    [cartItems]
  )

  const validate = () => {
    const nextErrors = {}
    Object.entries(form).forEach(([key, value]) => {
      if (!value.trim()) nextErrors[key] = 'This field is required'
    })
    if (form.phone.trim() && !/^\d{10}$/.test(form.phone.trim())) nextErrors.phone = 'Phone must contain 10 digits'
    if (form.pincode.trim() && !/^\d{6}$/.test(form.pincode.trim())) nextErrors.pincode = 'Pincode must contain 6 digits'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(prev => ({ ...prev, [name]: value }))
    setErrors(prev => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  const loadRazorpayScript = () => new Promise(resolve => {
    if (window.Razorpay) return resolve(true)
    const existing = document.querySelector('script[data-razorpay]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.dataset.razorpay = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return
    if (!cartItems.length) return

    setPlacingOrder(true)
    setSubmitError('')

    try {
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error('Unable to load Razorpay Checkout')

      const { data } = await api.post('/orders/create-payment-order', { shippingAddress: form })

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopKart',
        description: 'ShopKart Order',
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.fullName,
          contact: form.phone
        },
        handler: async (response) => {
          try {
            const verification = await api.post('/orders/verify-payment', {
              shopKartOrderId: data.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })
            resetCartState()
            navigate(`/order-success/${verification.data.order._id}`, { replace: true })
          } catch (error) {
            setSubmitError(getErrorMessage(error, 'Payment verification failed. Your cart has not been cleared.'))
            setPlacingOrder(false)
          }
        },
        modal: {
          ondismiss: () => setPlacingOrder(false)
        }
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.on('payment.failed', () => {
        setSubmitError('Payment failed. Your cart has not been cleared. Please try again.')
        setPlacingOrder(false)
      })
      paymentObject.open()
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Unable to start checkout.'))
      setPlacingOrder(false)
    }
  }

  if (loading) return <p className="text-center text-slate-500 mt-10">Loading checkout...</p>

  if (!cartItems.length) {
    return (
      <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded-lg shadow-md border border-slate-200 text-center">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Your cart is empty 🛒</h2>
        <p className="text-slate-600 mb-6">Add products before opening checkout.</p>
        <button onClick={() => navigate('/products')} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md">Browse Products</button>
      </div>
    )
  }

  const fields = [
    ['fullName', 'Full Name'],
    ['phone', 'Phone Number'],
    ['addressLine1', 'Address Line'],
    ['city', 'City'],
    ['state', 'State'],
    ['pincode', 'Pincode']
  ]

  return (
    <div className="max-w-5xl mx-auto mt-8 p-4 pb-12">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Checkout</h1>
      {submitError && <div className="mb-5 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">{submitError}</div>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow-md border border-slate-200 p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-5">Shipping Details</h2>
          <div className="space-y-4">
            {fields.map(([name, label]) => (
              <div key={name}>
                <label htmlFor={name} className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                <input id={name} name={name} value={form[name]} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {errors[name] && <p className="mt-1 text-sm text-red-600">{errors[name]}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-lg shadow-md border border-slate-200 p-6 h-fit">
          <h2 className="text-xl font-semibold text-slate-800 mb-5">Order Summary</h2>
          <div className="space-y-4">
            {cartItems.map(item => (
              <div key={item.product._id} className="flex gap-3 items-center">
                <img src={item.product.image} alt={item.product.name} className="w-14 h-14 object-cover rounded-md bg-slate-100" />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{item.product.name}</p>
                  <p className="text-sm text-slate-500">× {item.quantity}</p>
                </div>
                <p className="font-semibold text-slate-800">{formatPrice(item.product.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-200 mt-5 pt-4 space-y-2">
            <div className="flex justify-between text-slate-600"><span>Items</span><span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></div>
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-xl font-bold text-slate-900 pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
          </div>
          <button type="submit" disabled={placingOrder} className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold rounded-md">
            {placingOrder ? 'Opening Payment...' : 'Place Order'}
          </button>
        </section>
      </form>
    </div>
  )
}

export default Checkout
