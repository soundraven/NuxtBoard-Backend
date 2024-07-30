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
        res.status(500).send("validate fail")
    }

    const postinfo = req.body.post
    console.log(postinfo)

    const edit = `UPDATE post SET board_id = ?, title = ?, content = ? WHERE id = ?`

    try {
        const result = await connection.query(edit, [
            postinfo.boardId,
            postinfo.title,
            postinfo.content,
            postinfo.id,
        ])

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
