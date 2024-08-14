import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    console.log(req.body)
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
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
            } as ApiResponse)
        } catch (error) {
            errorHandler(res, error)
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
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
