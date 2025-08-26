import { pool } from "../config/db.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { createTransporter } from "../services/createTransporter.js"; 
import nodemailer from 'nodemailer'

const transporter = await createTransporter()

export const registerUser = async (req, res) => {

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

        const verificationToken = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await pool.query(
            "INSERT INTO is_email_valid (user_id, token, expires_at) VALUES ($1, $2, $3)",
            [newUser.rows[0].id, verificationToken, expiresAt]
        );

        const verificationLink = `http://localhost:1818/api/user/verify-email?token=${verificationToken}`;

        console.log("Verify your email:", verificationLink);

        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: newUser.rows[0].email,
            subject: "Verify your email",
            text: `Click here to verify your email: http://localhost:1818/api/user/verify-email?token=${verificationToken}`,
            html: `<p>Click here to verify your email: 
           <a href="http://localhost:1818/api/user/verify-email?token=${verificationToken}">
             Verify Email
           </a>
         </p>`,
        });


        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.status(201).json({
            message: "User registered successfully. Please check your email to verify.",
            previewUrl: nodemailer.getTestMessageUrl(info) 
        });
        // const token = jwt.sign(
        //     { id: newUser.rows[0].id },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "1h" }
        // );
        // console.log(newUser.rows)
        // return res.status(201).json({ user: newUser.rows[0], token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }


}