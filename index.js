import dotenv from "dotenv";
import connectDB from "./src/db/index.js"
import { app } from "./app.js"
dotenv.config({
    path: './env'
})

app.get("/", (req, res) => {
    res.status(200).json({ message: "Server is live on Vercel" });
});

connectDB()
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log(`server is running  on ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log("Server failed", err);
    })