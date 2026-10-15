import express from 'express'
import { getProducts, getCategories, getProductById, createProduct } from '../controllers/product.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const productRoutes = express.Router()

productRoutes.get('/', getProducts)
productRoutes.get('/categories', getCategories)
productRoutes.get('/:id', getProductById)
productRoutes.post('/', isAuthenticated, createProduct)

export default productRoutes
