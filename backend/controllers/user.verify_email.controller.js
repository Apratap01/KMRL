import { pool } from "../config/db.js";
export const emailVerification = async (req, res) => {
    try {
        const { token } = req.query;

        const result = await pool.query(
            "SELECT * FROM is_email_valid WHERE token=$1",
            [token]
        );

        if (result.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const verification = result.rows[0];
        if (new Date() > verification.expires_at) {
            return res.status(400).json({ message: "Token expired" });
        }

        // Mark user verified
        await pool.query("UPDATE users SET is_valid=true WHERE id=$1", [
            verification.user_id,
        ]);

        // delete token after use
        await pool.query("DELETE FROM is_email_valid WHERE id=$1", [
            verification.id,
        ]);

        res.json({ message: "Email verified successfully. You can now login." });
    } catch (error) {
        console.error("Verify Error:", error);
        res.status(500).json({ message: "Server error" });
    }
}