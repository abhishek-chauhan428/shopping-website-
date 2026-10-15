import express from 'express'
import {
    registerUser,
    loginUser,
    getUser,
    logoutUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword
} from '../controllers/user.controllers.js'
import isAuthenticated from '../middlewares/authMiddleware.js'

const userRoutes = express.Router()

userRoutes.post('/register', registerUser)
userRoutes.post('/login', loginUser)
userRoutes.get('/me', isAuthenticated, getUser)
userRoutes.post('/logout', isAuthenticated, logoutUser)

userRoutes.put('/profile', isAuthenticated, updateProfile)
userRoutes.put('/change-password', isAuthenticated, changePassword)
userRoutes.post('/forgot-password', forgotPassword)
userRoutes.post('/reset-password/:token', resetPassword)

export default userRoutes
