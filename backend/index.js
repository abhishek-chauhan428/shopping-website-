import express from "express";
import mongoose from "mongoose";
import dotenv from 'dotenv';
import cookieParser from "cookie-parser";
import cors from "cors";

import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import orderRoutes from "./routes/order.routes.js";

dotenv.config();
const app = express();

const port = 3333;

app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());

// Tiny request log so you can see in this terminal exactly what the frontend calls
app.use((req, res, next) => {
    res.on('finish', () => console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode}`));
    next();
});

app.use('/customers', userRoutes);
app.use('/products', productRoutes);
app.use('/cart', cartRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/orders', orderRoutes);

mongoose.connect(process.env.dbURL).then(() => {
    console.log('DB Connected');
}).catch((err) => {
    console.log(err);
});

app.listen(port, () => {
    console.log(`Server Started at ${port}`);
});
