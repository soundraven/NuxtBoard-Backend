import express, { Request, Response } from "express"
import { Userinfo, ApiResponse, CountResult } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (!req.body.user.email || !req.body.user.password) {
        return res.status(200).json({
            code: "E",
            errorCode: "001",
            message: "userinfo not exist",
        } as ApiResponse)
    }

    const userinfo: Userinfo = req.body.user
    const encryptedPassword: string = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    const duplicateCheck = `SELECT COUNT(email) AS count
        FROM userinfo
        WHERE email = ?`

    const regist = `INSERT INTO userinfo (email, password, username) VALUES (?, ?, ?)`

    try {
        const [result] = await connection.query<
            CountResult[] & RowDataPacket[]
        >(duplicateCheck, [userinfo.email])

        if (result[0].count > 0) {
            return res.status(200).json({
                code: "E",
                errorCode: "002",
                message: "Email already exist.",
            } as ApiResponse)
        }

        await connection.query(regist, [
            userinfo.email,
            encryptedPassword,
            userinfo.username,
        ])

        res.status(200).json({
            code: "S",
            message: "Registration success.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
