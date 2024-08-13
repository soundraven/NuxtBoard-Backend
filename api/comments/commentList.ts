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

    try {
        const postId = req.params.id

        const [commentListResult, replyListResult] = await Promise.all([
            connection.query<RowDataPacket[]>(
                `SELECT 
                    comment.*,
                    user_info.user_name
                FROM 
                    comment
                LEFT JOIN 
                    user_info ON comment.registered_by = user_info.id
                WHERE
                    post_id = ? AND comment.active = 1`,
                [postId]
            ),
            connection.query<RowDataPacket[]>(
                `SELECT 
                    reply.*,
                    user_info.user_name
                FROM 
                    reply
                LEFT JOIN 
                    user_info ON reply.registered_by = user_info.id
                WHERE
                    post_id = ? AND reply.active = 1`,
                [postId]
            ),
        ])

        const mappedCommentList = commentListResult[0].map((comment) => ({
            ...comment,
            replies: replyListResult[0].filter(
                (reply) => reply.comment_id === comment.id
            ),
        }))

        res.status(200).json({
            code: "S",
            message: "Successfully get list of comments",
            commentList: mappedCommentList,
        } as ApiResponse)
    } catch (error) {
        return errorHandler(res, error)
    }
})

export default router
