import { generateAccessToken, generateRefreshToken } from './user.controller.js'
import { verifyGoogleToken } from '../services/googleService.js'
import { pool } from '../config/db.js'

export const handleGoogleSignIn = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) return res.status(400).json({ message: "No token provided" });

        const payload = await verifyGoogleToken(token);
        const { email, name } = payload;

        let result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        let user;

        if (result.rows.length === 0) {
            const insert = await pool.query(
                `INSERT INTO users (name, email, password, provider, is_valid)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING *`,
                [name, email, null, "google", true]
            );
            user = insert.rows[0];
        }
        else {
            user = result.rows[0];
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Use user.id directly, not user.rows[0].id
        await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [user.id]);
        await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [user.id, refreshToken]);

        const isProduction = process.env.NODE_ENV === "production";

        const options = {
            httpOnly: true,
            secure: isProduction,         
            sameSite: isProduction ? "none" : "lax",
        };

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({ user, accessToken, refreshToken, message: "User logged in Successfully" });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Error in Google sign-in from backend');
    }
};
