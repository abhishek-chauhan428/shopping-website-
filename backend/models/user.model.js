import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String,
        required: true
    },

    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
                min: 1
            }
        }
    ],

    wishlist: {
        type: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            }
        ],
        default: []
    },

    resetPasswordToken: {
        type: String,
        default: undefined
    },

    resetPasswordExpire: {
        type: Date,
        default: undefined
    }
}, {
    timestamps: true
});


const User = mongoose.model('User', userSchema)

export default User
