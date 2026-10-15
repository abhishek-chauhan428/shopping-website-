// Run with: npm run seed
// Populates the database with sample products so the catalog isn't empty.
import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/product.model.js";

dotenv.config();

const sampleProducts = [
    {
        name: "Wireless Headphones",
        description: "Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.",
        price: 2999,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        category: "Electronics",
        stock: 25
    },
    {
        name: "Smart Watch",
        description: "Fitness tracking smartwatch with heart-rate monitor, GPS, and 7-day battery life.",
        price: 4499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        category: "Electronics",
        stock: 15
    },
    {
        name: "Running Shoes",
        description: "Lightweight breathable running shoes with cushioned soles for daily training.",
        price: 1899,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        category: "Footwear",
        stock: 40
    },
    {
        name: "Backpack",
        description: "Water-resistant 30L backpack with laptop compartment, perfect for travel and work.",
        price: 1299,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        category: "Bags",
        stock: 30
    },
    {
        name: "Coffee Maker",
        description: "Programmable drip coffee maker with 12-cup carafe and auto shut-off.",
        price: 2299,
        image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500",
        category: "Home & Kitchen",
        stock: 20
    },
    {
        name: "Yoga Mat",
        description: "Non-slip extra-thick yoga mat with carrying strap, ideal for home workouts.",
        price: 799,
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        category: "Fitness",
        stock: 50
    },
    {
        name: "Desk Lamp",
        description: "LED desk lamp with adjustable brightness and color temperature, USB powered.",
        price: 999,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500",
        category: "Home & Kitchen",
        stock: 35
    },
    {
        name: "Sunglasses",
        description: "Polarized UV-protection sunglasses with a lightweight metal frame.",
        price: 1499,
        image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
        category: "Accessories",
        stock: 45
    }
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.dbURL);
        console.log("DB Connected");

        await Product.deleteMany({});
        console.log("Cleared existing products");

        const inserted = await Product.insertMany(sampleProducts);
        console.log(`Inserted ${inserted.length} sample products`);

        await mongoose.disconnect();
        console.log("Done. DB connection closed.");
        process.exit(0);
    } catch (error) {
        console.error("SEED ERROR:", error);
        process.exit(1);
    }
};

seed();
