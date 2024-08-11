import express, { Request, Response } from "express"
import { UserInfo, ApiResponse, CountResult } from "../structure/interface"
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

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return res.status(200).json({
            code: "E",
            errorCode: "006",
            message: "Validation failed.",
        } as ApiResponse)
    }

    const user = req.body.user
    const username = req.body.username

    const setUsername = `UPDATE user_info SET username = ? WHERE id = ?`

    try {
        const result = await connection.execute<RowDataPacket[]>(setUsername, [
            username,
            user.id,
        ])

        res.status(200).json({
            code: "S",
            message: "Username set success.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
