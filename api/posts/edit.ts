import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return errorHandler(res, "Validation failed", 401)
    }

    const postInfo = req.body.post

    try {
        await connection.execute(
            `UPDATE post SET board_id = ?, title = ?, content = ? WHERE id = ?`,
            [postInfo.boardId, postInfo.title, postInfo.content, postInfo.id]
        )

        res.status(200).json({
            success: true,
            message: "Successfully edited",
        } as GeneralServerResponse)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
