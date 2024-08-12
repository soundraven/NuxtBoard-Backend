import express, { Request, Response } from "express"
import { UserInfo, ApiResponse, NewUser } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const NewUser: NewUser = req.body.user

    if (!NewUser.email || !NewUser.password) {
        return res.status(400).json({
            code: "F",
            message: "UserInfo not exist",
        } as ApiResponse)
    }

    const encryptedPassword: string = crypto
        .createHash("sha256")
        .update(NewUser.password + process.env.PWSALT)
        .digest("hex")

    try {
        const [result] = await connection.query<RowDataPacket[]>(
            `SELECT COUNT(email) AS count FROM user_info WHERE email = ?`,
            [NewUser.email]
        )

        if (result[0].count > 0) {
            return res.status(409).json({
                code: "E",
                message: "Email already exist.",
            } as ApiResponse)
        }

        await connection.query(
            `INSERT INTO user_info (email, password, user_name) VALUES (?, ?, ?)`,
            [NewUser.email, encryptedPassword, NewUser.userName]
        )

        res.status(200).json({
            code: "S",
            message: "Registration success.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
