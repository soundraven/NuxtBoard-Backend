import express, { Request, Response } from "express"
import { Userinfo } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()
console.log(router)

router.post("/", async (req: Request, res: Response) => {
    console.log("Received request:", req.body)

    const userinfo: Userinfo = req.body
    const encryptedPassword = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    try {
        const db = (req as any).db
        if (!db) {
            console.log("Database not initialized")
            return res.status(500).json({ message: "Database not initialized" })
        }

        if (!req.body) {
            console.error("userinfo not exist")
            return res.status(500).json({ message: "userinfo not exist" })
        }

        const [result] = await db.execute(
            "INSERT INTO userinfo (email, password) VALUES (?, ?)",
            [userinfo.email, encryptedPassword]
        )

        console.log("User registered successfully:", result)
        res.status(201).json({ message: "success" })
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message)
            res.status(400).json({ message: "fail", error: error.message })
        } else {
            console.error("Unknown error occurred")
            res.status(400).json({
                message: "fail",
                error: "Unknown error occurred",
            })
        }
    }
})

export default router
