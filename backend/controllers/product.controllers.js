import mongoose from "mongoose"
import Product from "../models/product.model.js"


export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query

        const filter = {}

        if (search) {
            filter.name = { $regex: search, $options: "i" }
        }

        if (category && category !== "All") {
            filter.category = category
        }

        const products = await Product.find(filter)
            .select("name price category image stock")
            .sort({ createdAt: -1 })

        res.status(200).json({
            success: true,
            count: products.length,
            products
        })
    } catch (error) {
        console.log("GET PRODUCTS ERROR:", error)
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}


export const getCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category')
        res.status(200).json({ success: true, categories })
    } catch (error) {
        console.log("GET CATEGORIES ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const getProductById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" })
        }

        const product = await Product.findById(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ success: true, product })
    } catch (error) {
        console.log("GET PRODUCT ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, stock } = req.body

        if (!name || !description || price === undefined || !image || !category) {
            return res.status(400).json({ message: 'All fields are required!' })
        }

        if (Number(price) <= 0) {
            return res.status(400).json({ message: 'Price must be greater than 0' })
        }

        if (stock !== undefined && Number(stock) < 0) {
            return res.status(400).json({ message: 'Stock cannot be negative' })
        }

        const product = await Product.create({ name, description, price, image, category, stock })

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            product
        })
    } catch (error) {
        if (error.name === "ValidationError") {
            return res.status(400).json({ message: error.message })
        }
        console.log("CREATE PRODUCT ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
