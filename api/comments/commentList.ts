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

    let getCommentList = `SELECT 
        comment.*,
        userinfo.username
    FROM 
        comment
    LEFT JOIN 
        userinfo ON comment.registered_by = userinfo.id
    WHERE
        post_id = ? AND comment.active = 1`

    let getReplyList = `SELECT 
        reply.*,
        userinfo.username
    FROM 
        reply
    LEFT JOIN 
        userinfo ON reply.registered_by = userinfo.id
    WHERE
        comment_id = ? AND reply.active = 1`

    try {
        const [commentList] = await connection.query<RowDataPacket[]>(
            getCommentList,
            [postId]
        )

        // console.log(commentList)

        res.status(200).json({
            code: "S",
            message: "Successfully get list of comments",
            commentList: commentList,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
