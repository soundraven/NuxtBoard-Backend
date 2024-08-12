import express, { Request, Response } from "express"
import { UserInfo, ApiResponse, LoginUserInfo } from "../structure/interface"
import crypto from "crypto"
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

    const loginUser: LoginUserInfo = req.body.user

    if (!loginUser.email || !loginUser.password) {
        return res.status(400).json({
            code: "F",
            message: "UserInfo not exist",
        } as ApiResponse)
    }

    const encryptedPassword: string = crypto
        .createHash("sha256")
        .update(loginUser.password + process.env.PWSALT)
        .digest("hex")

    try {
        const [dbUserInfo] = await connection.query<
            LoginUserInfo[] & RowDataPacket[]
        >(
            `SELECT id, email, password, username, active FROM user_info WHERE email = ?`,
            [loginUser.email]
        )

        if (!dbUserInfo) {
            return res.status(401).json({
                code: "E",
                message: "User not exist",
            } as ApiResponse)
        }

        if (
            loginUser.email !== dbUserInfo[0].email ||
            encryptedPassword !== dbUserInfo[0].password
        ) {
            return res.status(401).json({
                code: "E",
                message: "Email or Password not matched",
            } as ApiResponse)
        }

        if (dbUserInfo[0].active === 0) {
            return res.status(410).json({
                code: "E",
                message: "Already resigned user",
            } as ApiResponse)
        }

        const { password, ...userWithoutPassword } = dbUserInfo[0]
        const user: UserInfo = userWithoutPassword

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
            message: "Login success",
            user: user,
            refreshToken: refreshToken,
            accessToken: accessToken,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
