import express from 'express'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'
import {router as userRouter} from './routes/user.routes.js'
import {router as docsRouter} from './routes/docs.routes.js'
import {router as chatRouter} from './routes/chat.routes.js'
import cookieParser from 'cookie-parser'
import cors from "cors";
import summaryRouter from './routes/summary.routes.js'


dotenv.config()

const app = express()

const PORT = process.env.PORT || 1818

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json())
app.use(cookieParser())

app.get('/',(req,res)=>{
    res.send('Welcome to Backend')
})

connectDB()

app.use('/api/user',userRouter)
app.use('/api/docs',docsRouter)
app.use('/api/summary',summaryRouter)
app.use('/api/chat',chatRouter)


app.listen(PORT,()=>{
    console.log(`App is running on the port - ${PORT}`);
})