// import { VercelRequest, VercelResponse } from "@vercel/node"

// export default function handler(req: VercelRequest, res: VercelResponse) {
//     res.setHeader("Access-Control-Allow-Credentials", true)
//     res.setHeader("Access-Control-Allow-Origin", "*")
//     res.setHeader(
//         "Access-Control-Allow-Methods",
//         "GET,OPTIONS,PATCH,DELETE,POST,PUT"
//     )

//     if (req.body.email === rightEmail && req.body.password === rightPassword) {
//         res.status(200).json({ message: "success" })
//     } else {
//         res.status(401).json({ message: "fail" })
//     }
// }

const express = require("express")
const cors = require("cors")

const app = express()

const rightEmail = "1q2w3e4r@gmail.com"
const rightPassword = "1q2w3e4r"

// Use the CORS middleware
app.use(
    cors({
        origin: "https://nuxt-board-frontend.vercel.app", // Replace with your frontend URL
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
)

// Middleware to parse JSON bodies
app.use(express.json())

// Handle preflight requests
app.options("/api/users/login", (req, res) => {
    res.set(
        "Access-Control-Allow-Origin",
        "https://nuxt-board-frontend.vercel.app"
    )
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    res.status(204).send("")
})

// Define routes
app.post("/api/users/login", (req, res) => {
    if (req.body.email === rightEmail && req.body.password === rightPassword) {
        res.status(200).json({ message: "success" })
    } else {
        res.status(401).json({ message: "fail" })
    }
})

module.exports = app
