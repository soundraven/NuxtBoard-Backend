import express, { Request, Response } from "express"
import { UserInfo, ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import { accessTokenExpires, generateToken } from "../utils/generateToken"
import jwt from "jsonwebtoken"
import { convertToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        const refreshToken: string = req.body.refreshToken

        if (!refreshToken) {
            return res.status(401).json({
                code: "F",
                message: "Auth failed",
            } as ApiResponse)
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_SECRET as string
        ) as jwt.JwtPayload
        const userId = decoded.id

        const [dbUserInfo] = await connection.execute<
            UserInfo[] & RowDataPacket[]
        >(
            `SELECT id, email, user_name, registered_date, active FROM user_info WHERE id = ?`,
            [userId]
        )

        if (!dbUserInfo) {
            return res.status(410).json({
                code: "F",
                message: "User not exist",
            })
        }

        const user = convertToCamelcase<UserInfo>(dbUserInfo[0])

        const newAccessToken = generateToken(user, accessTokenExpires, "access")

        res.status(200).json({
            code: "S",
            message: "Successfully created new access tokens",
            newAccessToken: newAccessToken,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
