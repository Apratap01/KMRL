import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

dotenv.config()

const app = express()

const PORT = process.env.PORT || 1818

app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Welcome to Backend')
})



connectDB()


app.listen(PORT,()=>{
    console.log(`App is running on the port - ${PORT}`);
})