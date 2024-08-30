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

        const result = await connection.execute<ResultSetHeader>(
            `UPDATE post SET board_id = ?, title = ?, content = ? WHERE id = ?`,
            [postInfo.boardId, postInfo.title, postInfo.content, postInfo.id]
        )

        if (result[0].affectedRows < 1) {
            return errorHandler(res, "Failed to update post.", 500)
        }

        await connection.execute(
            `UPDATE post_file SET active = 0 WHERE post_id = ?`,
            [postInfo.id]
        )

        if (postInfo.files && postInfo.files.length > 0) {
            const fileInsertPromises = postInfo.files.map((fileUrl: string) => {
                return connection!.execute(
                    "INSERT INTO post_file (post_id, file_url) VALUES (?, ?)",
                    [postInfo.id, fileUrl]
                )
            })
            await Promise.all(fileInsertPromises)
        }

        res.status(200).json({
            success: true,
            message: "Successfully updated",
        } as GeneralServerResponse)
    } catch (error) {
        return errorHandler(res, "An unexpected error occurred.", 500, error)
    }
})

export default router
