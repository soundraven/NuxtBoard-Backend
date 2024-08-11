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

    const getCommentList = `SELECT 
        comment.*,
        user_info.username
    FROM 
        comment
    LEFT JOIN 
        user_info ON comment.registered_by = user_info.id
    WHERE
        post_id = ? AND comment.active = 1`

    const getReplyList = `SELECT 
        reply.*,
        user_info.username
    FROM 
        reply
    LEFT JOIN 
        user_info ON reply.registered_by = user_info.id
    WHERE
        post_id = ? AND reply.active = 1`

    try {
        const [commentListResult, replyListResult] = await Promise.all([
            connection.query<RowDataPacket[]>(getCommentList, [postId]),
            connection.query<RowDataPacket[]>(getReplyList, [postId]),
        ])

        const commentList = commentListResult[0]
        const replyList = replyListResult[0]

        console.log(commentList, replyList)

        const mappedCommentList = commentList.map((comment) => ({
            ...comment,
            replies: replyList.filter(
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
