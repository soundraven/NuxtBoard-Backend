import { Request, Response, NextFunction } from "express"
import { Userinfo, ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

const selectToken = `SELECT * 
        FROM user_auths
        WHERE token = ? AND expires > NOW()`

const selectUser = `SELECT id, email, username, registered_date
        FROM userinfo 
        WHERE id = ?`

export default async function validateToken(
    req: Request,
    res: Response,
    next: NextFunction
) {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    console.log("middlewares")

    const token = req.headers["authorization"]?.split(" ")[1] || ""

    if (token === "") {
        res.status(401).json({
            code: "F",
            message: "Auth failed",
        } as ApiResponse)
        return
    }

    try {
        const [validate] = await connection.query<RowDataPacket[]>(
            selectToken,
            [token]
        )

        if (validate.length <= 0) {
            return res.status(401).json({
                code: "F",
                errorCode: "004",
                message: "Auth expired or not exists",
            } as ApiResponse)
        }

        const userId = validate[0].registered_by

        const [user] = await connection.query<Userinfo[] & RowDataPacket[]>(
            selectUser,
            [userId]
        )

        if (user.length <= 0) {
            return res.status(500).json({
                code: "F",
                errorCode: "005",
                message: "Userinfo not exist",
            } as ApiResponse)
        }

        res.locals.validatedUser = { user: user[0], token: token }
        next()
    } catch (error) {
        errorHandler(res, error as Error)
    }
}
