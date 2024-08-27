import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
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

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return errorHandler(res, "Validation failed.", 401)
    }

    try {
        const { user, userName } = req.body

        await connection.execute<RowDataPacket[]>(
            `UPDATE user_info SET user_name = ? WHERE id = ?`,
            [userName, user.id]
        )

        res.status(200).json({
            success: true,
            message: "UserName set success.",
        } as GeneralServerResponse)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
