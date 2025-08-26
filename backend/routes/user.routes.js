import { Router } from 'express'
import { pool } from '../config/db.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { generateAccessToken, generateRefreshToken } from '../controllers/user.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

export const router = Router()

router.post('/register', async (req, res) => {

    try {
        const { email, password, name } = req.body
        if (!email || !password || !name) {
            return res.status(400).json({ "message": "Check your details" })
        }

        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ "message": "User already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password , provider) VALUES ($1, $2, $3 , $4) RETURNING id, name, email, provider, created_at",
            [name, email, hashedPassword, "manual"]
        );

        const token = jwt.sign(
            { id: newUser.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        console.log(newUser.rows)
        return res.status(201).json({ user: newUser.rows[0], token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }


})

router.post('/login', async (req, res) => {

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

        const accessToken = generateAccessToken(existingUser.rows[0])
        const refreshToken = generateRefreshToken(existingUser.rows[0])

        await pool.query("DELETE FROM refresh_tokens WHERE user_id = $1", [existingUser.rows[0].id]);

        await pool.query("INSERT INTO refresh_tokens (user_id, token) VALUES ($1, $2)", [existingUser.rows[0].id, refreshToken]);

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // only https in prod
            sameSite: "strict"
        };


        const loggedInUser = await pool.query(
            "SELECT id,email,name FROM users WHERE email = $1",
            [email]
        );

        return res
        .status(200)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',refreshToken,options)
        .json({"user":loggedInUser.rows[0],"accessToken":accessToken,"refreshToken":refreshToken,"message":"User logged in Successfully"})
    }
    catch (err) {
        console.log(err.message)
        return res.status(500).send("Server error during login")
    }

})
//secured routes
router.post('/logout', verifyJWT, async (req, res) => {
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
});

router.post('/refresh', async (req, res) => {
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
});

