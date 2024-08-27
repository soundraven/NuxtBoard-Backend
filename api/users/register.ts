import express, { Request, Response } from "express"
import { NewUser } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        const newUser: NewUser = req.body.user

        if (!newUser.email || !newUser.password) {
            return errorHandler(res, "UserInfo not exist", 400)
        }

        const encryptedPassword: string = crypto
            .createHash("sha256")
            .update(newUser.password + process.env.PWSALT)
            .digest("hex")

        const [result] = await connection.execute<RowDataPacket[]>(
            `SELECT COUNT(email) AS count FROM user_info WHERE email = ?`,
            [newUser.email]
        )

        if (result[0].count > 0) {
            return errorHandler(res, "Email already exist.", 409)
        }

        await connection.execute(
            `INSERT INTO user_info (email, password, user_name) VALUES (?, ?, ?)`,
            [newUser.email, encryptedPassword, newUser.userName]
        )

        res.status(200).json({
            success: true,
            message: "Registration success.",
        })
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
