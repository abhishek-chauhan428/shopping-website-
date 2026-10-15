import User from "../models/user.model.js"
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import genToken from "../utils/genToken.js"
import sendEmail from "../utils/sendEmail.js"

const cookieOptions = {
    httpOnly: true,
}

export const registerUser = async (req, res) => {
    const { fullName, email, password, phone } = req.body

    try {
        if (!fullName || !password || !email || !phone) {
            return res.status(400).json({ message: 'All fields are Required!' })
        }

        const E = await User.findOne({ email })

        if (E) {
            return res.status(409).json({ message: 'Email must be unique' })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password too short' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await User.create({ fullName, email, password: hashedPassword, phone })

        newUser.password = undefined

        res.status(200).json({
            success: true,
            message: "customer registered successfully",
            customer: newUser
        })

    } catch (error) {
        console.log("REGISTER ERROR:", error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}

export const loginUser = async (req, res) => {
    console.log("LOGIN ROUTE HIT")

    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const exists = await User.findOne({ email })

        if (!exists) {
            return res.status(401).json({ message: "email not found" })
        }

        const correctPassword = bcrypt.compareSync(password, exists.password)

        if (!correctPassword) {
            return res.status(401).json({ message: "details are incorrect" })
        }

        const token = genToken(exists._id)
        res.cookie("token", token, cookieOptions)

        exists.password = undefined
        res.status(200).json({
            message: "Login Successfull",
            customer: exists,
        })

    } catch (error) {
        console.log("LOGIN ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export const logoutUser = async (req, res) => {
    res.clearCookie("token", cookieOptions)

    return res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

export const getUser = (req, res) => {
    res.status(200).json(req.user)
}


export const updateProfile = async (req, res) => {
    try {
        const { fullName, phone, email } = req.body

        if (!fullName || !phone || !email) {
            return res.status(400).json({ message: 'All fields are Required!' })
        }

        if (email !== req.user.email) {
            const emailTaken = await User.findOne({ email, _id: { $ne: req.user._id } })
            if (emailTaken) {
                return res.status(409).json({ message: 'Email must be unique' })
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { fullName, phone, email },
            { new: true, runValidators: true }
        )

        updatedUser.password = undefined

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            customer: updatedUser
        })
    } catch (error) {
        console.log("UPDATE PROFILE ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password too short" })
        }

        const user = await User.findById(req.user._id)

        const correctPassword = bcrypt.compareSync(currentPassword, user.password)

        if (!correctPassword) {
            return res.status(401).json({ message: "Current password is incorrect" })
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        res.status(200).json({
            success: true,
            message: "Password changed successfully"
        })
    } catch (error) {
        console.log("CHANGE PASSWORD ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: "Email is required" })
        }

        const user = await User.findOne({ email })

        const genericResponse = {
            success: true,
            message: "If an account with that email exists, a password reset link has been sent."
        }

        if (!user) {
            return res.status(200).json(genericResponse)
        }

        const rawToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

        user.resetPasswordToken = hashedToken
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000 
        await user.save()

        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
        const resetUrl = `${clientUrl}/reset-password/${rawToken}`

        try {
            await sendEmail({
                to: user.email,
                subject: 'ShopKart - Password Reset Request',
                html: `
                    <p>Hi ${user.fullName},</p>
                    <p>You requested a password reset. Click the link below to set a new password. This link expires in 15 minutes.</p>
                    <p><a href="${resetUrl}">${resetUrl}</a></p>
                    <p>If you did not request this, you can safely ignore this email.</p>
                `
            })
        } catch (emailError) {
            console.log("SEND EMAIL ERROR:", emailError)
            user.resetPasswordToken = undefined
            user.resetPasswordExpire = undefined
            await user.save()
            return res.status(500).json({ message: "Failed to send reset email. Please try again later." })
        }

        res.status(200).json(genericResponse)
    } catch (error) {
        console.log("FORGOT PASSWORD ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params
        const { newPassword } = req.body

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "New password too short" })
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ message: "Reset link is invalid or has expired" })
        }

        user.password = await bcrypt.hash(newPassword, 10)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()

        res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now log in with your new password."
        })
    } catch (error) {
        console.log("RESET PASSWORD ERROR:", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}
