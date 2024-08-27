import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { ResultSetHeader } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        if (!req.body || !req.body.user.id) {
            return errorHandler(res, "UserInfo not exist", 400)
        }

        const validatedUser = res.locals.validatedUser

        const user = req.body.user
        const token = req.headers["authorization"]?.split(" ")[1] || ""

        if (
            user.id !== validatedUser.user.id ||
            token !== validatedUser.token
        ) {
            return errorHandler(res, "User auth not matched", 400)
        }

        const [deactivate] = await connection.execute<ResultSetHeader>(
            `UPDATE user_info SET active = 0 WHERE id = ?`,
            [user.id]
        )

        if (deactivate.affectedRows === 0) {
            return errorHandler(res, "User not found", 400)
        }

        res.status(200).json({
            success: true,
            message: "Account successfully deactivated",
        } as GeneralServerResponse)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
