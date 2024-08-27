import express, { Request, Response } from "express"
import {} from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

const router = express.Router()

router.post("/like", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        if (res.locals.validatedUser.user.id !== req.body.user.id) {
            return res.status(200).json({
                code: "E",
                errorCode: "006",
                message: "Validation failed.",
            })
        }

        const postId = req.body.postId
        const userId = res.locals.validatedUser.user.id

        const [likedHistory] = await connection.execute<RowDataPacket[]>(
            `SELECT liked, disliked FROM like_info WHERE post_id = ? AND registered_by = ?`,
            [postId, userId]
        )

        if (likedHistory.length > 0) {
            if (likedHistory[0].liked === 1) {
                return res.status(200).json({
                    code: "E",
                    message: "Already liked",
                })
            }

            await connection.execute(
                `UPDATE like_info SET liked = ?, disliked = ? WHERE post_id = ? AND registered_by = ?`,
                [1, likedHistory[0].disliked, postId, userId]
            )
        } else {
            await connection.execute(
                `INSERT INTO like_info (post_id, registered_by, liked) VALUES (?, ?, ?)`,
                [postId, userId, 1]
            )
        }

        res.status(200).json({
            code: "S",
            message: "Successfully liked.",
        })
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

router.post("/dislike", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        if (res.locals.validatedUser.user.id !== req.body.user.id) {
            return res.status(200).json({
                code: "E",
                errorCode: "006",
                message: "Validation failed.",
            })
        }

        const postId = req.body.postId
        const userId = res.locals.validatedUser.user.id

        const [likedHistory] = await connection.execute<RowDataPacket[]>(
            `SELECT liked, disliked FROM like_info WHERE post_id = ? AND registered_by = ?`,
            [postId, userId]
        )

        if (likedHistory.length > 0) {
            if (likedHistory[0].disliked === 1) {
                return res.status(200).json({
                    code: "E",
                    message: "Already disliked",
                })
            }

            await connection.execute(
                `UPDATE like_info SET liked = ?, disliked = ? WHERE post_id = ? AND registered_by = ?`,
                [likedHistory[0].liked, 1, postId, userId]
            )
        } else {
            await connection.execute(
                `INSERT INTO like_info (post_id, registered_by, disliked) VALUES (?, ?, ?)`,
                [postId, userId, 1]
            )
        }

        res.status(200).json({
            code: "S",
            message: "Successfully disliked.",
        })
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
