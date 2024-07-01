import express, { Request, Response } from "express"
import { Userinfo, ApiResponse } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (!req.body) {
        return res.status(400).json({
            code: "E",
            errorCode: "001",
            message: "userinfo not exist",
        } as ApiResponse)
    }

    const userinfo: Userinfo = req.body
    const encryptedPassword = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    try {
        const [duplicateCheck] = await connection.query(
            `SELECT COUNT('email') AS 'count'
        FROM 'userinfo'
        WHERE 'email' = ?`,
            [req.body.email]
        )

        if (duplicateCheck[0].count > 0) {
            return res.status(400).json({
                code: "E",
                errorCode: "002",
                message: "email already exist",
            } as ApiResponse)
        }

        await connection.query(
            `INSERT INTO userinfo (email, password, username) VALUES (?, ?, ?)`,
            [userinfo.email, encryptedPassword, userinfo.username]
        )

        res.status(200).json({
            code: "S",
            message: "Login success",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
