import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { ResultSetHeader } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        if (!req.body || !req.body.user.id) {
            return res.status(200).json({
                code: "E",
                errorCode: "001",
                message: "UserInfo not exist",
            } as ApiResponse)
        }

        const validatedUser = res.locals.validatedUser

        const user = req.body.user
        const token = req.headers["authorization"]?.split(" ")[1] || ""

        if (
            user.id !== validatedUser.user.id ||
            token !== validatedUser.token
        ) {
            return res.status(200).json({
                code: "E",
                message: "User auth not matched",
            } as ApiResponse)
        }

        const [deactivate] = await connection.execute<ResultSetHeader>(
            `UPDATE user_info SET active = 0 WHERE id = ?`,
            [user.id]
        )

        if (deactivate.affectedRows === 0) {
            return res.status(200).json({
                code: "E",
                message: "User not found",
            } as ApiResponse)
        }

        res.status(200).json({
            code: "S",
            message: "Account successfully deactivated",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
