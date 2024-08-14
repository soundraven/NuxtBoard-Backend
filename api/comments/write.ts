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

    const { postId, comment, reply, commentId } = req.body
    const registeredBy = res.locals.validatedUser.user.id

    if (commentId) {
        try {
            const result = await connection.execute<ResultSetHeader>(
                `INSERT INTO 
                    reply (post_id, comment_id, content, registered_by) 
                VALUES (?, ?, ?, ?)`,
                [postId, commentId, reply, registeredBy]
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
        const result = await connection.execute<ResultSetHeader>(
            `INSERT INTO 
                comment (post_id, content, registered_by) 
            VALUES (?, ?, ?)`,
            [postId, comment, registeredBy]
        )

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
