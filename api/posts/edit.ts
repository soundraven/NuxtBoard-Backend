import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return res.status(200).json({
            code: "E",
            message: "Validation failed.",
        } as ApiResponse)
    }

    const postInfo = req.body.post

    const edit = `UPDATE post SET board_id = ?, title = ?, content = ? WHERE id = ?`

    try {
        await connection.query(edit, [
            postInfo.boardId,
            postInfo.title,
            postInfo.content,
            postInfo.id,
        ])

        res.status(200).json({
            code: "S",
            message: "Successfully edited",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
