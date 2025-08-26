import { pool } from "../config/db.js";
import jwt from 'jsonwebtoken';
import { generateAccessToken } from "./user.controller.js";
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) return res.status(401).json({ message: "No refresh token" });

        const storedToken = await pool.query(
            "SELECT * FROM refresh_tokens WHERE token = $1",
            [refreshToken]
        );
        if (storedToken.rows.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        const newAccessToken = generateAccessToken({ id: decoded.id });
        return res
            .cookie('accessToken', newAccessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production" })
            .status(200)
            .json({ accessToken: newAccessToken });
    } catch (err) {
        console.error(err);
        return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
};