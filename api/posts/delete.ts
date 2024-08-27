import express, { Request, Response } from "express"
import {} from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        return res.status(200).json({
            code: "E",
            errorCode: "006",
            message: "Validation failed.",
        })
    }

    const postId = req.body.postId

    try {
        await connection.execute(`UPDATE post SET active = 0 WHERE id = ?`, [
            postId,
        ])

        res.status(200).json({
            code: "S",
            message: "Post successfully edited",
        })
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
