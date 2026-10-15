import mongoose from "mongoose"
import User from "../models/user.model.js"
import Product from "../models/product.model.js"

const PRODUCT_FIELDS = "name price category image stock"

const getPopulatedCart = async (userId) => {
    const user = await User.findById(userId).populate({
        path: "cart.product",
        select: PRODUCT_FIELDS
    })

    return user.cart.filter((item) => item.product)
}

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const findCartItem = (user, productId) =>
    user.cart.find((item) => item.product.toString() === productId)



export const getCart = async (req, res) => {
    try {
        const cart = await getPopulatedCart(req.user._id)
        res.status(200).json({ success: true, cart })
    } catch (error) {
        console.log("GET CART ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}



export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!isValidId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const user = await User.findById(req.user._id)
        const existingItem = findCartItem(user, productId)
        const newQuantity = existingItem ? existingItem.quantity + 1 : 1

        if (newQuantity > product.stock) {
            return res.status(400).json({
                message: product.stock === 0
                    ? "This product is out of stock"
                    : `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`
            })
        }

        if (existingItem) {
            existingItem.quantity = newQuantity
        } else {
            user.cart.push({ product: productId, quantity: 1 })
        }

        await user.save()

        const cart = await getPopulatedCart(user._id)
        res.status(200).json({ success: true, message: "Cart updated", cart })
    } catch (error) {
        console.log("ADD TO CART ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}



export const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        if (!isValidId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        if (typeof quantity !== "number" || !Number.isInteger(quantity)) {
            return res.status(400).json({ message: "Quantity must be a whole number" })
        }

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" })
        }

        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const user = await User.findById(req.user._id)
        const item = findCartItem(user, productId)
        if (!item) {
            return res.status(404).json({ message: "Product not in cart" })
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                message: `Only ${product.stock} unit${product.stock === 1 ? "" : "s"} available`
            })
        }

        item.quantity = quantity
        await user.save()

        const cart = await getPopulatedCart(user._id)
        res.status(200).json({ success: true, message: "Cart updated", cart })
    } catch (error) {
        console.log("UPDATE CART ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}



export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!isValidId(productId)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const user = await User.findById(req.user._id)
        user.cart = user.cart.filter((item) => item.product.toString() !== productId)
        await user.save()

        const cart = await getPopulatedCart(user._id)
        res.status(200).json({ success: true, message: "Item removed", cart })
    } catch (error) {
        console.log("REMOVE FROM CART ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}



export const clearCart = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
        user.cart = []
        await user.save()

        res.status(200).json({ success: true, message: "Cart cleared", cart: [] })
    } catch (error) {
        console.log("CLEAR CART ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
