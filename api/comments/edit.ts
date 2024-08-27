import express, { Request, Response } from "express"
import {} from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    const { comment, reply, commentId, replyId } = req.body

    if (commentId) {
        try {
            await connection.execute(
                `UPDATE comment SET content = ? WHERE id = ?`,
                [comment, commentId]
            )

            return res.status(200).json({
                code: "S",
                message: "Successfully edited",
            })
        } catch (error) {
            errorHandler(res, "An unexpected error occurred.")
        }
    }

    try {
        await connection.execute(`UPDATE reply SET content = ? WHERE id = ?`, [
            reply,
            replyId,
        ])

        return res.status(200).json({
            code: "S",
            message: "Successfully edited",
        })
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
