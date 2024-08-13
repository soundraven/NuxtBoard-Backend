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

    try {
        if (res.locals.validatedUser.user.id !== req.body.user.id) {
            res.status(200).json({
                code: "E",
                errorCode: "006",
                message: "validation failed",
            })
        }

        const postInfo = req.body.post
        const registeredBy = res.locals.validatedUser.user.id

        const result = await connection.execute<ResultSetHeader>(
            `INSERT INTO 
                post (board_id, title, content, registered_by) 
            VALUES (?, ?, ?, ?)`,
            [postInfo.boardId, postInfo.title, postInfo.content, registeredBy]
        )

        if (result[0].affectedRows < 1) {
            return res.status(200).json({
                code: "E",
                message: "Failed to post",
            } as ApiResponse)
        }

        console.log(result[0].insertId)
        res.status(200).json({
            code: "S",
            message: "Successfully posted",
            postId: result[0].insertId,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
