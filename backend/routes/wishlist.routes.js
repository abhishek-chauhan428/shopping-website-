import express from 'express'
import { addToWishlist, getWishlist, removeFromWishlist } from '../controllers/wishlist.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const wishlistRoutes = express.Router()

wishlistRoutes.use(isAuthenticated)

wishlistRoutes.get('/', getWishlist)
wishlistRoutes.post('/:productId', addToWishlist)
wishlistRoutes.delete('/:productId', removeFromWishlist)

export default wishlistRoutes
