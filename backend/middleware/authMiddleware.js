import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
    let token;

    // Read JWT from the 'jwt' cookie
    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token, excluding the password
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                res.status(401).json({ message: "Not authorized, user not found" });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export { protect };
