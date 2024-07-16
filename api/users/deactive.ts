import express, { Request, Response } from "express"
import { Userinfo, ApiResponse, CountResult } from "../structure/interface"
import crypto from "crypto"
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

    if (!req.body || !req.body.user.id) {
        return res.status(400).json({
            code: "E",
            errorCode: "001",
            message: "userinfo not exist",
        } as ApiResponse)
    }

    const validatedUser = res.locals.validatedUser
    console.log(validatedUser)

    const { user, token } = req.body

    const deactivateQuery = ` UPDATE userinfo
        SET active = 0
        WHERE id = ?`

    try {
        if (
            user.id !== validatedUser.user.id ||
            token !== validatedUser.token
        ) {
            return res.status(401).json({
                code: "E",
                message: "User auth not matched",
            } as ApiResponse)
        }

        const [deactivate] = await connection.execute<ResultSetHeader>(
            deactivateQuery,
            [user.id]
        )

        if (deactivate.affectedRows === 0) {
            return res.status(404).json({
                code: "F",
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
