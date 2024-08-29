import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { ResultSetHeader } from "mysql2"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        if (res.locals.validatedUser.user.id !== req.body.user.id) {
            return errorHandler(res, "Validation failed", 401)
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
            errorHandler(res, "Failed to post.", 500)
        }

        console.log(result[0].insertId)
        res.status(200).json({
            success: true,
            message: "Successfully posted",
            data: {
                postId: result[0].insertId,
            },
        } as GeneralServerResponse<{ postId: number }>)
    } catch (error) {
        return errorHandler(res, "An unexpected error occurred.", 500, error)
    }
})

export default router
