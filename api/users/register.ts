import express, { Request, Response } from "express"
import { Userinfo } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"

dotenv.config()

const router = express.Router()

router.post("/register", async (req: Request, res: Response) => {
    const userinfo: Userinfo = req.body
    const encryptedPassword = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    try {
        if (!req.db) {
            return res.status(500).json({ message: "Database not initialized" })
        }

        const [result] = await req.db.execute(
            "INSERT INTO userinfo (email, password) VALUES (?, ?)",
            [userinfo.email, encryptedPassword]
        )

        res.status(201).json({ message: "success" })
    } catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ message: "fail", error: error.message })
        } else {
            res.status(400).json({
                message: "fail",
                error: "Unknown error occurred",
            })
        }
    }
})

export default router
