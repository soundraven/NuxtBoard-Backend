import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

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

    const postId = req.body.postId
    const reportedBy = res.locals.validatedUser.user.id

    const reportHistory = `SELECT * FROM report WHERE post_id = ? AND reported_by = ?`
    const insertReport = `INSERT INTO report (post_id, reported_by) VALUES (?, ?)`
    const reportPost = `UPDATE post SET report = report + 1 WHERE id = ?`
    const reportCountCheck = `SELECT report FROM post WHERE id = ?`
    const autoDelete = `UPDATE post SET active = 0 WHERE id = ?`

    try {
        const [checkHistory] = await connection.execute<RowDataPacket[]>(
            reportHistory,
            [postId, reportedBy]
        )
        console.log(checkHistory)

        if (checkHistory.length > 0) {
            return res.status(200).json({
                code: "E",
                message: "Already reported this post",
            } as ApiResponse)
        }

        await Promise.all([
            connection.execute(insertReport, [postId, reportedBy]),
            connection.execute(reportPost, [postId]),
        ])

        const [reportCount] = await connection.execute<RowDataPacket[]>(
            reportCountCheck,
            [postId]
        )
        console.log(reportCount[0])

        if (reportCount[0].report >= 5) {
            await connection.execute<RowDataPacket[]>(autoDelete, [postId])

            return res.status(200).json({
                code: "S",
                message: "Post successfully deleted by report",
            } as ApiResponse)
        }

        return res.status(200).json({
            code: "S",
            message: "Post successfully reported",
        } as ApiResponse)
    } catch (error) {
        return errorHandler(res, error)
    }
})

export default router
