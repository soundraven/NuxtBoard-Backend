import express, { Request, Response } from "express"
import { Userinfo, ApiResponse, CountResult } from "../structure/interface"
import crypto from "crypto"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const getPostList = `SELECT 
        post.*,
        boardinfo.board_id AS boardinfo_board_id,
        boardinfo.board_name
    FROM 
        post
    LEFT JOIN 
        boardinfo ON post.board_id = boardinfo.board_id
    ORDER BY
        post.id DESC
    LIMIT 20`

    try {
        const [postList] = await connection.query<RowDataPacket[]>(getPostList)

        res.status(200).json({
            code: "S",
            message: "Successfully get list of posts",
            data: postList,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
