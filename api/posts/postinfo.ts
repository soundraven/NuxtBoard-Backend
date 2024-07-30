import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.get("/:id", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const postId = req.params.id

    const getPostinfo = `SELECT 
        post.*,
        boardinfo.board_id AS boardinfo_board_id,
        boardinfo.board_name
    FROM 
        post
    LEFT JOIN 
        boardinfo ON post.board_id = boardinfo.board_id
    WHERE
        post.id = ?`

    try {
        const [postinfo] = await connection.query<RowDataPacket[]>(
            getPostinfo,
            [postId]
        )

        res.status(200).json({
            code: "S",
            message: "Successfully get list of posts",
            postinfo: postinfo[0],
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
