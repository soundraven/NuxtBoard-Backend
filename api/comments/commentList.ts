import express, { Request, Response } from "express"
import {
    CommentInfo,
    GeneralServerResponse,
    ReplyInfo,
} from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import {
    convertArrayToCamelcase,
    convertToCamelcase,
} from "../utils/convertToCamelcase"
import dayjs from "dayjs"

dotenv.config()

const router = express.Router()

router.get("/:id", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        const postId = req.params.id
        console.log(postId)

        const [commentListResult, replyListResult] = await Promise.all([
            connection.execute<CommentInfo[] & RowDataPacket[]>(
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
            connection.execute<ReplyInfo[] & RowDataPacket[]>(
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

        const commentInfoWithFormattedDate = commentList.map((commentInfo) => {
            return {
                ...commentInfo,
                formattedDate: dayjs(commentInfo.registeredDate).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            }
        })

        const replyList = convertArrayToCamelcase<ReplyInfo>(
            replyListResult[0] as ReplyInfo[]
        )

        const replyListWithFormattedDate = replyList.map((replyList) => {
            return {
                ...replyList,
                formattedDate: dayjs(replyList.registeredDate).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            }
        })

        const mappedCommentList = commentInfoWithFormattedDate.map(
            (comment) => ({
                ...comment,
                replies: replyListWithFormattedDate.filter(
                    (reply) => reply.commentId === comment.id
                ),
            })
        )

        console.log(mappedCommentList)

        res.status(200).json({
            success: true,
            message: "Successfully get list of comments",
            data: {
                commentList: mappedCommentList,
            },
        } as GeneralServerResponse<{ commentList: CommentInfo[] }>)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
