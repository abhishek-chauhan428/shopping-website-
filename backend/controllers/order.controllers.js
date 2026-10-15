import crypto from 'crypto'
import mongoose from 'mongoose'
import User from '../models/user.model.js'
import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
import { createRazorpayOrder, getRazorpayKeyId } from '../config/razorpay.js'

const requiredAddressFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode']

const validateShippingAddress = (shippingAddress) => {
    if (!shippingAddress || typeof shippingAddress !== 'object') {
        return 'Shipping address is required'
    }

    for (const field of requiredAddressFields) {
        if (typeof shippingAddress[field] !== 'string' || !shippingAddress[field].trim()) {
            return `${field} is required`
        }
    }

    if (!/^\d{10}$/.test(shippingAddress.phone.trim())) {
        return 'Phone must contain 10 digits'
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode.trim())) {
        return 'Pincode must contain 6 digits'
    }

    return null
}

const validateCartAndBuildSnapshot = async (userId) => {
    const user = await User.findById(userId).lean()

    if (!user) {
        const error = new Error('User not found')
        error.status = 401
        throw error
    }

    if (!user.cart?.length) {
        const error = new Error('Your cart is empty')
        error.status = 400
        throw error
    }

    const productIds = user.cart.map(item => item.product)
    const products = await Product.find({ _id: { $in: productIds } })
        .select('name price image stock')
        .lean()

    const productMap = new Map(products.map(product => [product._id.toString(), product]))
    const items = []
    let totalAmount = 0

    for (const cartItem of user.cart) {
        const product = productMap.get(cartItem.product.toString())

        if (!product) {
            const error = new Error('A product in your cart is no longer available')
            error.status = 400
            throw error
        }

        if (cartItem.quantity > product.stock) {
            const error = new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`)
            error.status = 400
            throw error
        }

        const itemTotal = product.price * cartItem.quantity
        totalAmount += itemTotal

        items.push({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity: cartItem.quantity,
            image: product.image || ''
        })
    }

    return { items, totalAmount }
}

export const createPaymentOrder = async (req, res) => {
    try {
        const validationError = validateShippingAddress(req.body?.shippingAddress)
        if (validationError) {
            return res.status(400).json({ success: false, message: validationError })
        }

        const { items, totalAmount } = await validateCartAndBuildSnapshot(req.user._id)
        const shippingAddress = Object.fromEntries(
            requiredAddressFields.map(field => [field, req.body.shippingAddress[field].trim()])
        )

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress,
            totalAmount,
            paymentStatus: 'PENDING',
            status: 'PENDING_PAYMENT'
        })

        try {
            const razorpayOrder = await createRazorpayOrder({
                amount: Math.round(totalAmount * 100),
                currency: 'INR',
                receipt: order._id.toString()
            })

            order.razorpayOrderId = razorpayOrder.id
            await order.save()

            return res.status(201).json({
                success: true,
                shopKartOrderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key: getRazorpayKeyId()
            })
        } catch (error) {
            await Order.findByIdAndDelete(order._id)
            throw error
        }
    } catch (error) {
        const status = error.status || 500
        res.status(status).json({
            success: false,
            message: status === 500 ? 'Unable to create payment order' : error.message
        })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}

        if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: 'Invalid ShopKart order ID' })
        }

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification data is incomplete' })
        }

        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id })
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        if (order.paymentStatus === 'PAID') {
            return res.status(200).json({ success: true, order })
        }

        if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) {
            return res.status(400).json({ success: false, message: 'Invalid Razorpay order' })
        }

        const secret = process.env.RAZORPAY_KEY_SECRET
        if (!secret) {
            return res.status(500).json({ success: false, message: 'Razorpay test credentials are not configured' })
        }

        const body = `${order.razorpayOrderId}|${razorpay_payment_id}`
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex')

        const expected = Buffer.from(expectedSignature, 'utf8')
        const received = Buffer.from(razorpay_signature, 'utf8')

        if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
            return res.status(400).json({ success: false, message: 'Invalid payment signature' })
        }

        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(401).json({ success: false, message: 'Unauthorized' })
        }

        order.paymentStatus = 'PAID'
        order.status = 'PLACED'
        order.razorpayPaymentId = razorpay_payment_id
        await order.save()

        user.cart = []
        await user.save()

        res.status(200).json({ success: true, order })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to verify payment' })
    }
}

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .lean()

        res.status(200).json({ success: true, orders })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to load orders' })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' })
        }

        const order = await Order.findOne({ _id: id, user: req.user._id }).lean()

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        res.status(200).json({ success: true, order })
    } catch (error) {
        res.status(500).json({ success: false, message: 'Unable to load order' })
    }
}
