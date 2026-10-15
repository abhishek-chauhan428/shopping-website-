import mongoose from "mongoose"
import User from "../models/user.model.js"
import Product from "../models/product.model.js"

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        const user = await User.findById(req.user._id)

        const alreadyInWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        )

        if (alreadyInWishlist) {
            return res.status(409).json({ message: "Product already in wishlist" })
        }

        user.wishlist.push(productId)
        await user.save()

        res.status(200).json({
            success: true,
            message: "Product added to wishlist"
        })
    } catch (error) {
        console.log("ADD TO WISHLIST ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: "wishlist",
            select: "name price category image stock"
        })

        res.status(200).json({
            success: true,
            count: user.wishlist.length,
            wishlist: user.wishlist
        })
    } catch (error) {
        console.log("GET WISHLIST ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const user = await User.findById(req.user._id)

        const isInWishlist = user.wishlist.some(
            (id) => id.toString() === productId
        )

        if (!isInWishlist) {
            return res.status(404).json({ message: "Product not in wishlist" })
        }

        user.wishlist = user.wishlist.filter(
            (id) => id.toString() !== productId
        )
        await user.save()

        res.status(200).json({
            success: true,
            message: "Product removed from wishlist"
        })
    } catch (error) {
        console.log("REMOVE FROM WISHLIST ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
