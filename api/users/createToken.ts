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

        if (dbuserinfo[0].id !== user.id) {
            return res.status(200).json({
                code: "E",
                message: "User id not matched",
            })
        }

        let token =
            user.email +
            Math.floor(Math.random() * 1000000).toString() +
            new Date().getTime().toString()

        token = crypto.createHash("sha256").update(token).digest("hex")

        const expires: number =
            Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24

        await connection.execute(insertToken, [token, user.id, expires])

        res.status(200).json({
            code: "S",
            message: "Successfully create new token",
            token: token,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
