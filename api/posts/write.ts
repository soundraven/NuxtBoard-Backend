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

    const postinfo = req.body.post
    const registeredBy = res.locals.validatedUser.user.id

    const write = `INSERT INTO 
        post (board_id, title, content, registered_by) 
        VALUES (?, ?, ?, ?)`

    try {
        const result = await connection.execute<ResultSetHeader>(write, [
            postinfo.boardId,
            postinfo.title,
            postinfo.content,
            registeredBy,
        ])

        console.log(result)
        if (result[0].affectedRows < 1) {
            return res.status(500).json({
                code: "F",
                message: "Failed to post",
            } as ApiResponse)
        }

        console.log(result[0].insertId)
        res.status(200).json({
            code: "S",
            message: "Successfully posted",
            postId: result[0].insertId,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
