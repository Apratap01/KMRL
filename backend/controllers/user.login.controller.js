import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateAccessToken } from "./user.controller.js";
import { generateRefreshToken } from "./user.controller.js";
export const loginUser = async (req, res) => {

    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ 'message': 'Invalid Credentials' })
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length === 0) {
            return res.status(400).json({ 'message': 'User Not Found' })
        }


        const isPasswordCorrect = await bcrypt.compare(password, existingUser.rows[0].password)

        if (!isPasswordCorrect) {
            return res.status(400).json({ 'message': 'Invalid Credentials' })
        }

        // if (!existingUser.rows[0].is_valid) {
        //     return res.status(403).json({ message: "Please verify your email first" });
        // }

        const accessToken = generateAccessToken(existingUser.rows[0])
        const refreshToken = generateRefreshToken(existingUser.rows[0])

        await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [existingUser.rows[0].id]);

        await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [existingUser.rows[0].id, refreshToken]);

        const isProduction = process.env.NODE_ENV === "production";

        const options = {
            httpOnly: true,
            secure: isProduction,        
            sameSite: isProduction ? "none" : "lax",
        };


        const loggedInUser = await pool.query(
            "SELECT id,email,name,is_valid FROM users WHERE email = $1",
            [email]
        );

        return res
            .status(200)
            .cookie('accessToken', accessToken, options)
            .cookie('refreshToken', refreshToken, options)
            .json({ "user": loggedInUser.rows[0], "accessToken": accessToken, "refreshToken": refreshToken, "message": "User logged in Successfully" })
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send("Server error during login")
    }

}