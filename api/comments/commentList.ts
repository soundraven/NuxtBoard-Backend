import express, { Request, Response } from "express"
import { ApiResponse, CommentInfo, ReplyInfo } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import {
    convertArrayToCamelcase,
    convertToCamelcase,
} from "../utils/convertToCamelcase"

dotenv.config()

const router = express.Router()

router.get("/:id", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        const postId = req.params.id

        const [commentListResult, replyListResult] = await Promise.all([
            connection.query<CommentInfo[] & RowDataPacket[]>(
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
            connection.query<ReplyInfo[] & RowDataPacket[]>(
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

        const commentList = convertArrayToCamelcase<CommentInfo>(
            commentListResult[0] as CommentInfo[]
        )
        const replyList = convertArrayToCamelcase<ReplyInfo>(
            replyListResult[0] as ReplyInfo[]
        )

        const mappedCommentList = commentList.map((comment) => ({
            ...comment,
            replies: replyList.filter(
                (reply) => reply.commentId === comment.id
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
