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

    const comment = req.body.comment
    const commentId = req.body.commentId

    const edit = `UPDATE comment SET content = ? WHERE id = ?`

    try {
        const result = await connection.execute(edit, [comment, commentId])

        console.log(result)

        res.status(200).json({
            code: "S",
            message: "Successfully edited",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
