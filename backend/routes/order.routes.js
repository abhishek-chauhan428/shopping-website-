import express from 'express'
import isAuthenticated from '../middlewares/authMiddleware.js'
import { createPaymentOrder, verifyPayment, getOrders, getOrderById } from '../controllers/order.controllers.js'

const orderRoutes = express.Router()

orderRoutes.use(isAuthenticated)
orderRoutes.post('/create-payment-order', createPaymentOrder)
orderRoutes.post('/verify-payment', verifyPayment)
orderRoutes.get('/', getOrders)
orderRoutes.get('/:id', getOrderById)

export default orderRoutes
