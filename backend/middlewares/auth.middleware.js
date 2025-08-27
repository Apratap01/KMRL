import { pool } from '../config/db.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const verifyJWT = async (req, res, next) => {
    try {

        if (req.originalUrl?.includes("/verify-email") || req.url?.includes("/verify-email")) {
            return next(); 
        }

        let token = null;
        
        // Try to get from cookies first
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        // Try to get from Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.slice(7); // Remove 'Bearer ' prefix
        }
        // Also check the 'authorization' header in lowercase (case sensitivity)
        else if (req.headers.Authorization && req.headers.Authorization.startsWith('Bearer ')) {
            token = req.headers.Authorization.slice(7);
        }

        if (!token || token.trim() === '') {
            console.log("No valid token provided");
            return res.status(401).json({ message: "Unauthorized Access - No Token Provided" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const result = await pool.query(
            "SELECT id, email, is_valid, name FROM users WHERE id = $1",
            [decodedToken?.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid Token - User Not Found" });
        }

        const user = result.rows[0];

        if (user.is_valid === false) {
            console.log("User account not verified:", user.email);
            return res.status(401).json({ message: "Account not verified. Please verify your email." });
        }

        req.user = user;
        console.log("User authenticated successfully:", user.email);
        next();
    }
    catch (err) {
        console.error("JWT verification failed:", err.message);
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired. Please login again." });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token format." });
        }
        return res.status(401).json({ message: "Unauthorized or Expired Token" });
    }
};
