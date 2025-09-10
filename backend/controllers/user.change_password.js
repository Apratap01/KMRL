import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";

export const changePassword = async(req,res) => {

    try {
        const {newPassword} = req.body
        const token = req.params.token
    
        if(!newPassword){
            return res.status(400).json({"message":"Password not provided"})
        }
    
        const findUser = await pool.query(`SELECT * FROM USERS WHERE reset_password_token=$1`,[token])
    
        if(findUser.rows.length===0){
            return res.status(400).json({"message":"User not found or Token Expired"})
        }
    
        const userId = findUser.rows[0].id
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
    
        await pool.query(`UPDATE users SET password = $1 WHERE id = $2`,[hashedPassword,userId])
    
        return res.status(200).json({"message":"Password Reset Successful"})
    } 
    catch (error) {
        console.log(error.message)
        return res.status(500).json({"message":"Server Error in changing password"})
    }
}