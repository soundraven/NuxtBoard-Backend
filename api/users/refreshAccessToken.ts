import express, { Request, Response } from "express"
import { UserInfo, GeneralServerResponse } from "../structure/interface"
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
        return errorHandler(res, "Database connection not available")
    }

    try {
        const refreshToken: string = req.body.refreshToken

        if (!refreshToken) {
            return errorHandler(res, "Auth failed", 401)
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
            return errorHandler(res, "User not exist", 410)
        }

        const user = convertToCamelcase<UserInfo>(dbUserInfo[0])

        const newAccessToken = generateToken(user, accessTokenExpires, "access")

        res.status(200).json({
            success: false,
            message: "Successfully created new access tokens",
            data: {
                newAccessToken: newAccessToken,
            },
        } as GeneralServerResponse<{ newAccessToken: string }>)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
