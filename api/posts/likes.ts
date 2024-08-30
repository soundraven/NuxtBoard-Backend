import express, { Request, Response } from "express"
import { GeneralServerResponse, LikedHistory } from "../structure/interface"
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
            return errorHandler(res, "Validation failed", 401)
        }

        const postId = req.body.postId
        const userId = res.locals.validatedUser.user.id

        const [likedHistoryResult] = await connection.execute<RowDataPacket[]>(
            `SELECT liked, disliked FROM like_info WHERE post_id = ? AND registered_by = ?`,
            [postId, userId]
        )

        const likedHistory = likedHistoryResult[0] as LikedHistory | undefined

        if (likedHistory && likedHistory.liked === 1) {
            return errorHandler(res, "Already liked", 409)
        }

        if (likedHistory) {
            await connection.execute(
                `UPDATE like_info SET liked = ? WHERE post_id = ? AND registered_by = ?`,
                [1, postId, userId]
            )
        }

        await connection.execute(
            `INSERT INTO like_info (post_id, registered_by, liked) VALUES (?, ?, ?)`,
            [postId, userId, 1]
        )

        res.status(200).json({
            success: true,
            message: "Successfully liked.",
        } as GeneralServerResponse)
    } catch (error) {
        return errorHandler(res, "An unexpected error occurred.", 500, error)
    }
})

router.post("/dislike", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        if (res.locals.validatedUser.user.id !== req.body.user.id) {
            return errorHandler(res, "Validation failed", 401)
        }

        const postId = req.body.postId
        const userId = res.locals.validatedUser.user.id

        const [likedHistoryResult] = await connection.execute<RowDataPacket[]>(
            `SELECT liked, disliked FROM like_info WHERE post_id = ? AND registered_by = ?`,
            [postId, userId]
        )

        const likedHistory = likedHistoryResult[0] as LikedHistory | undefined

        if (likedHistory && likedHistory.disliked === 1) {
            return errorHandler(res, "Already disliked", 409)
        }

        if (likedHistory) {
            await connection.execute(
                `UPDATE like_info SET disliked = ? WHERE post_id = ? AND registered_by = ?`,
                [1, postId, userId]
            )
        }

        await connection.execute(
            `INSERT INTO like_info (post_id, registered_by, disliked) VALUES (?, ?, ?)`,
            [postId, userId, 1]
        )

        res.status(200).json({
            success: true,
            message: "Successfully disliked.",
        } as GeneralServerResponse)
    } catch (error) {
        return errorHandler(res, "An unexpected error occurred.", 500, error)
    }
})

export default router
