import express from 'express';
import cors from 'cors';
import router from './routes/test.js';
import authRouter from './routes/auth.js';
import cookieParser from 'cookie-parser';
import { upload } from './middlewares/multer-storage.js';

const app = express();

app.use(cors({
    origin: process.env.ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: '16kb' }))
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static("public"));
app.use(cookieParser())

app.use('/beta/test', router)
app.use('/api/v1', upload.fields([
    {
        name: "profile_photo",
        maxCount: 1
    },
    {
        name: 'cover_photo',
        maxCount: 1
    }
]), authRouter)

export { app }