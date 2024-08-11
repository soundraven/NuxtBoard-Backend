import express, { Request, Response } from "express"
import { UserInfo, ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import { generateToken } from "../utils/generateToken"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const user: UserInfo = req.body.user

    try {
        const [dbUserInfo] = await connection.execute<
            UserInfo[] & RowDataPacket[]
        >(
            `SELECT id, email, username, registered_date, active
            FROM user_info 
            WHERE id = ?`,
            [user.id]
        )

        if (!dbUserInfo) {
            return res.status(410).json({
                code: "F",
                message: "User not exist",
            })
        }

        if (dbUserInfo[0].id !== user.id) {
            return res.status(200).json({
                code: "E",
                message: "User id not matched",
            })
        }

        const refreshTokenExpires: number =
            Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
        const accessTokenExpires: number =
            Math.floor(Date.now() / 1000) + 60 * 15

        const [refreshToken, accessToken] = await Promise.all([
            generateToken(user, refreshTokenExpires, "refresh"),
            generateToken(user, accessTokenExpires, "access"),
        ])

        await connection.execute(
            `INSERT INTO user_auth (token, registered_by, expires) VALUES (?, ?, FROM_UNIXTIME(?))`,
            [refreshToken, user.id, refreshTokenExpires]
        )

        res.status(200).json({
            code: "S",
            message: "Successfully create new token",
            refreshToken: refreshToken,
            accessToken: accessToken,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
