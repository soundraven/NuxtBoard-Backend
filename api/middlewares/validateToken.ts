import { Request, Response, NextFunction } from "express"
import { UserInfo, ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"

dotenv.config()

const selectToken = `SELECT * 
        FROM user_auths
        WHERE token = ? AND expires > NOW()`

const selectUser = `SELECT id, email, username, registered_date, active
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

    if (!token) {
        return res.status(401).json({
            code: "F",
            message: "Auth failed",
        } as ApiResponse)
    }

    console.log("middlewares2")

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload
        const userId = decoded.id

        const [user] = await connection.query<UserInfo[] & RowDataPacket[]>(
            `SELECT id, email, username, registered_date, active FROM user_info WHERE id = ?`,
            [userId]
        )

        console.log(user)

        if (user.length < 1) {
            return res.status(404).json({
                code: "F",
                message: "User not exist",
            } as ApiResponse)
        }

        if (user[0].active === 0) {
            return res.status(410).json({
                code: "F",
                message: "Already resigned user",
            } as ApiResponse)
        }

        res.locals.validatedUser = { user: user[0], token: token }
        next()
    } catch (error) {
        errorHandler(res, error as Error)
    }
}
