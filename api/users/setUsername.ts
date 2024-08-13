import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
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
            message: "Validation failed.",
        } as ApiResponse)
    }

    try {
        const { user, userName } = req.body

        await connection.execute<RowDataPacket[]>(
            `UPDATE user_info SET user_name = ? WHERE id = ?`,
            [userName, user.id]
        )

        res.status(200).json({
            code: "S",
            message: "UserName set success.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
