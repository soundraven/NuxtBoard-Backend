import express, { Request, Response } from "express"
import {
    UserInfo,
    GeneralServerResponse,
    LoginUserInfo,
} from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import {
    accessTokenExpires,
    generateToken,
    refreshTokenExpires,
} from "../utils/generateToken"
import { convertToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        const loginUser: LoginUserInfo = req.body.user

        if (!loginUser.email || !loginUser.password) {
            return errorHandler(res, "UserInfo not exist", 400)
        }

        const encryptedPassword: string = crypto
            .createHash("sha256")
            .update(loginUser.password + process.env.PWSALT)
            .digest("hex")

        const [dbUserInfo] = await connection.execute<
            LoginUserInfo[] & RowDataPacket[]
        >(
            `SELECT id, email, password, user_name, active FROM user_info WHERE email = ?`,
            [loginUser.email]
        )

        if (!dbUserInfo) {
            return errorHandler(res, "User not exist", 401)
        }

        if (
            loginUser.email !== dbUserInfo[0].email ||
            encryptedPassword !== dbUserInfo[0].password
        ) {
            return errorHandler(res, "Email or Password not matched", 401)
        }

        if (dbUserInfo[0].active === 0) {
            return errorHandler(res, "Already resigned user", 410)
        }

        const { password, ...userWithoutPassword } = dbUserInfo[0]

        const user = convertToCamelcase<UserInfo>(userWithoutPassword)

        const [refreshToken, accessToken] = await Promise.all([
            generateToken(user, refreshTokenExpires, "refresh"),
            generateToken(user, accessTokenExpires, "access"),
        ])

        await connection.execute(
            `INSERT INTO user_auth (token, registered_by, expires) VALUES (?, ?, FROM_UNIXTIME(?))`,
            [refreshToken, user.id, refreshTokenExpires]
        )

        res.status(200).json({
            success: true,
            message: "Login success",
            data: {
                user: user,
                refreshToken: refreshToken,
                accessToken: accessToken,
            },
        } as GeneralServerResponse<{ user: UserInfo; refreshToken: string; accessToken: string }>)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
