import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';

export const verifyJWT = async (req, res, next) => {
    const headerToken = req.header("Authorization");
    const incomingToken = req.cookies.accessToken || headerToken && headerToken.split(" ")[1];

    if (!incomingToken) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    try {
        const decodedToken = jwt.decode(incomingToken);
        if (!decodedToken._id) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const existingUser = await User.findById(decodedToken._id).select("-password -refresh_token");
        if (!existingUser) {
            return res.status(401).json({ message: "Unauthorized" })
        }

        req.user = existingUser;        
        next();

    } catch (error) {
        console.log('middleware error', error);
    }
}