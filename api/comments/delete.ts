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
            errorCode: "006",
            message: "Validation failed.",
        } as ApiResponse)
    }

    try {
        const commentId = req.body.commentId

        await connection.execute(`UPDATE comment SET active = 0 WHERE id = ?`, [
            commentId,
        ])

        res.status(200).json({
            code: "S",
            message: "Comment successfully deleted",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
