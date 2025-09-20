import { pool } from '../config/db.js';

export const completeProfile = async (req, res) => {
    try {
        const { userId, department } = req.body;

        if (!userId || !department) {
            return res.status(400).json({ message: "User ID and department are required" });
        }

        const result = await pool.query(
            `UPDATE users 
             SET department = $1 
             WHERE id = $2 
             RETURNING id, name, email, department, is_valid, created_at`,
            [department, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Profile completed successfully",
            user: result.rows[0],
        });

    } catch (err) {
        console.error("Profile completion error:", err.message);
        return res.status(500).json({ message: "Server error while completing profile" });
    }
};
