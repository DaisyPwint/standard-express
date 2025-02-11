import doenv from 'dotenv';
import { app } from "./app.js";
import { connectMongoDB } from "./db/index.js";

doenv.config({
    path: '.env'
})

const PORT = process.env.PORT || 8000;

connectMongoDB()
.then(() => {
    app.listen(PORT, () => {
        console.log(`server is listening port ${PORT}`);
    })
}).catch((err) => {
    console.log('DB connection error',err);    
});
