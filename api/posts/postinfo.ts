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

    const getLikeinfo = `SELECT 
        SUM(liked) AS total_likes, SUM(disliked) AS total_dislikes
    FROM 
        likeinfo 
    WHERE 
        post_id = ?`

    try {
        const [postinfo, likeinfo] = await Promise.all([
            connection.query<RowDataPacket[]>(getPostinfo, [postId]),
            connection.query<RowDataPacket[]>(getLikeinfo, [postId]),
        ])

        res.status(200).json({
            code: "S",
            message: "Successfully get list of posts",
            postinfo: postinfo[0][0],
            likeinfo: likeinfo[0][0],
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
