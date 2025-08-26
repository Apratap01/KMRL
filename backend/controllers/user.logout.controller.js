import { pool } from "../config/db.js";
export const userLogout = async (req, res) => {
    try {
        const id = req.user.id;

        await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [id]);

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        return res.status(200).json({ message: "User logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Server error during logout" });
    }
}