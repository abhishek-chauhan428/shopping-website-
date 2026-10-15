import express from 'express'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../controllers/cart.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const cartRoutes = express.Router()

cartRoutes.use(isAuthenticated)

cartRoutes.get('/', getCart)

cartRoutes.delete('/clear', clearCart)

cartRoutes.post('/:productId', addToCart)
cartRoutes.patch('/:productId', updateCartItem)
cartRoutes.delete('/:productId', removeFromCart)

export default cartRoutes
