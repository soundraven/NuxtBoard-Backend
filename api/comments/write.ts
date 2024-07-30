import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { ResultSetHeader } from "mysql2"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (res.locals.validatedUser.user.id !== req.body.user.id) {
        res.status(500).send("validate fail")
    }

    const postId = req.body.postId
    const comment = req.body.comment

    const registeredBy = res.locals.validatedUser.user.id

    const write = `INSERT INTO 
        comment (post_id, content, registered_by) 
        VALUES (?, ?, ?)`

    try {
        const result = await connection.execute<ResultSetHeader>(write, [
            postId,
            comment,
            registeredBy,
        ])

        if (result[0].affectedRows < 1) {
            return res.status(500).json({
                code: "F",
                message: "Failed to post",
            } as ApiResponse)
        }

        res.status(200).json({
            code: "S",
            message: "Successfully posted",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
