import express, { Request, Response } from "express"
import { Userinfo } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

dotenv.config()

const router = express.Router()
console.log(router)

router.post("/", async (req: Request, res: Response) => {
    console.log("Received request:", req.body)
    if (!req.body) {
        console.error("userinfo not exist")
        return res.status(500).json({ message: "userinfo not exist" })
    }

    if (!connection) {
        throw new Error("Database connection not available")
    }

    const userinfo: Userinfo = req.body
    const encryptedPassword = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    try {
        const [result] = await connection.query(
            "INSERT INTO userinfo (email, password) VALUES (?, ?)",
            [userinfo.email, encryptedPassword]
        )

        console.log("User registered successfully:", result)
        res.status(201).json({ message: "success" })
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
