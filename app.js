import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors({
    origin: 'https://alps-new.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}))
app.use(express.json(
    {
        limit: "10mb"
    }

))
app.use(express.urlencoded(
    {
        extended: true,
        limit: "10mb"
    }
))
app.use('/upload', express.static(path.join(__dirname, 'upload')));
import { isAuthenticated, authorizeRoles } from "./src/middleware/auth.middleware.js"

app.use(cookieParser());
import userRouter from "./src/router/user.router.js"
app.use("/api/v1/user", userRouter);
import projectRouter from "./src/router/project.router.js"
app.use("/api/v1/project", isAuthenticated, projectRouter);
import ticketRouter from "./src/router/ticket.router.js"
app.use("/api/v1/ticket", isAuthenticated, ticketRouter)
export { app }