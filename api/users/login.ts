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

    if (!req.body) {
        return res.status(400).json({
            code: "E",
            errorCode: "001",
            message: "userinfo not exist",
        } as ApiResponse)
    }

    const userinfo: Userinfo = req.body
    const encryptedPassword = crypto
        .createHash("sha256")
        .update(userinfo.password + process.env.PWSALT)
        .digest("hex")

    const selectEmail = `SELECT COUNT(*) as count FROM userinfo WHERE email = ?`
    const selectUserinfo = `SELECT email, password FROM userinfo WHERE email = ?`
    const getUser = `SELECT email, id, username FROM userinfo WHERE email = ?`
    const insertToken = `INSERT INTO user_auths (token, registered_by, expires) VALUES (?, ?, FROM_UNIXTIME(?))`

    try {
        const [countResult] = await connection.query<
            CountResult[] & RowDataPacket[]
        >(selectEmail, [userinfo.email])

        if (countResult[0].count === 0) {
            return res.status(401).json({
                code: "E",
                errorCode: "003",
                message: "Email not exist.",
            } as ApiResponse)
        }

        const [dbUserinfo] = await connection.query<
            Userinfo[] & RowDataPacket[]
        >(selectUserinfo, [userinfo.email])

        if (
            dbUserinfo[0].email === userinfo.email &&
            dbUserinfo[0].password === encryptedPassword
        ) {
            const [user] = await connection.query<Userinfo[] & RowDataPacket[]>(
                getUser,
                [userinfo.email]
            )

            let token =
                userinfo.email +
                Math.floor(Math.random() * 1000000).toString() +
                new Date().getTime().toString()

            token = crypto.createHash("sha256").update(token).digest("hex")

            const expires =
                Math.floor(new Date().getTime() / 1000) + 60 * 60 * 24 * 7

            await connection.query(insertToken, [token, user[0].id, expires])

            res.status(200).json({
                code: "S",
                message: "Login success",
                data: { user: user[0], token: token },
            } as ApiResponse)
        } else {
            res.status(401).json({
                code: "E",
                errorCode: "004",
                message: "Incorrect email or password.",
            })
        }
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
