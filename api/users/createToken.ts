import express, { Request, Response } from "express"
import { Userinfo, ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import crypto from "crypto"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const selectUser = `SELECT id, email, username, registered_date, active
        FROM userinfo 
        WHERE id = ?`

    const insertToken = `INSERT INTO user_auths (token, registered_by, expires) VALUES (?, ?, FROM_UNIXTIME(?))`

    const user: Userinfo = req.body.user

    try {
        const [dbuserinfo] = await connection.execute<RowDataPacket[]>(
            selectUser,
            [user.id]
        )

        if (dbuserinfo.length === 0 || dbuserinfo[0].id !== user.id) {
            return res.status(200).json({
                code: "E",
                message: "User id not matched",
            })
        }

        let refreshToken =
            user.email +
            Math.floor(Math.random() * 1000000).toString() +
            new Date().getTime().toString()

        let accessToken =
            user.email +
            Math.floor(Math.random() * 1000000).toString() +
            new Date().getTime().toString()

        refreshToken = crypto
            .createHash("sha256")
            .update(refreshToken)
            .digest("hex")

        accessToken = crypto
            .createHash("sha256")
            .update(accessToken)
            .digest("hex")

        const refreshExpires: number =
            Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 7

        const accessTokenExpires: number =
            Math.floor(new Date().getTime() / 1000) + 60 * 15

        await connection.execute(insertToken, [
            refreshToken,
            user.id,
            refreshExpires,
        ])

        await connection.execute(insertToken, [
            accessToken,
            user.id,
            accessTokenExpires,
        ])

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
