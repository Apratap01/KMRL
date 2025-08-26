import { pool } from '../config/db.js'
import jwt from 'jsonwebtoken'

export const verifyJWT = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header('Authorization')?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Unauthorized Access - No Token Provided" });
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const result = await pool.query(
            "SELECT id, email, name FROM users WHERE id = $1",
            [decodedToken?.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid Token - User Not Found" });
        }

        req.user = result.rows[0];
        next();
    } 
    catch (err) {
        console.error("JWT verification failed:", err.message);
        return res.status(401).json({ message: "Unauthorized or Expired Token" });
    }
};
