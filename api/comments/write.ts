import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { ResultSetHeader } from "mysql2"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return res.status(500).send("validate fail")
    }

    const postId = req.body.postId
    const comment = req.body.comment
    const reply = req.body.reply
    const commentId = req.body.commentId
    const registeredBy = res.locals.validatedUser.user.id

    console.log(commentId)
    console.log(reply)

    const writeComment = `INSERT INTO 
        comment (post_id, content, registered_by) 
        VALUES (?, ?, ?)`

    const writeReply = `INSERT INTO 
        reply (comment_id, content, registered_by) 
        VALUES (?, ?, ?)`

    if (commentId) {
        try {
            const result = await connection.execute<ResultSetHeader>(
                writeReply,
                [commentId, reply, registeredBy]
            )

            if (result[0].affectedRows < 1) {
                return res.status(200).json({
                    code: "F",
                    message: "Failed to post",
                } as ApiResponse)
            }

            return res.status(200).json({
                code: "S",
                message: "Successfully posted",
            } as ApiResponse)
        } catch (error) {
            errorHandler(res, error)
        }
    }

    try {
        const result = await connection.execute<ResultSetHeader>(writeComment, [
            postId,
            comment,
            registeredBy,
        ])

        if (result[0].affectedRows < 1) {
            return res.status(200).json({
                code: "F",
                message: "Failed to post",
            } as ApiResponse)
        }

        res.status(200).json({
            code: "S",
            message: "Successfully posted",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
