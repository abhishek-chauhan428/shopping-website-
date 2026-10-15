import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token

        if (!token) {
          return  res.status(401).json({ message: "Unauthorized" })
        }

        const decoded = jwt.verify(token, process.env.jwt_secret)
        const user = await User.findById(decoded.userId)

        if (!user) {
           return res.status(401).json({ message: "Unauthorized" })
        }

        req.user = user
        next()
} catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}

export default isAuthenticated