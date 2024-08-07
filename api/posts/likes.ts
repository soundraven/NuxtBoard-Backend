import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

const router = express.Router()

router.post("/like", async (req: Request, res: Response) => {
    console.log("like")
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
    const userId = res.locals.validatedUser.user.id

    const likedHistoryQuery = `SELECT liked, disliked FROM likeinfo WHERE post_id = ? AND registered_by = ?`
    const updateLiked = `UPDATE likeinfo SET liked = ?, disliked = ? WHERE post_id = ? AND registered_by = ?`
    const insertLiked = `INSERT INTO likeinfo (post_id, registered_by, liked) VALUES (?, ?, ?)`

    try {
        const [likedHistory] = await connection.query<RowDataPacket[]>(
            likedHistoryQuery,
            [postId, userId]
        )

        console.log(likedHistory)

        if (likedHistory.length > 0) {
            if (likedHistory[0].liked === 1) {
                return res.status(200).json({
                    code: "E",
                    message: "Already liked",
                } as ApiResponse)
            }

            await connection.execute(updateLiked, [
                1,
                likedHistory[0].disliked,
                postId,
                userId,
            ])
        } else {
            await connection.execute(insertLiked, [postId, userId, 1])
        }

        res.status(200).json({
            code: "S",
            message: "Successfully liked.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

router.post("/dislike", async (req: Request, res: Response) => {
    console.log("dislike")
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
    const userId = res.locals.validatedUser.user.id

    const dislikedHistoryQuery = `SELECT liked, disliked FROM likeinfo WHERE post_id = ? AND registered_by = ?`
    const updateDisliked = `UPDATE likeinfo SET liked = ?, disliked = ? WHERE post_id = ? AND registered_by = ?`
    const insertDisliked = `INSERT INTO likeinfo (post_id, registered_by, disliked) VALUES (?, ?, ?)`

    try {
        const [likedHistory] = await connection.query<RowDataPacket[]>(
            dislikedHistoryQuery,
            [postId, userId]
        )

        console.log(likedHistory)

        if (likedHistory.length > 0) {
            if (likedHistory[0].disliked === 1) {
                return res.status(200).json({
                    code: "E",
                    message: "Already disliked",
                } as ApiResponse)
            }

            await connection.execute(updateDisliked, [
                likedHistory[0].liked,
                1,
                postId,
                userId,
            ])
        } else {
            await connection.execute(insertDisliked, [postId, userId, 1])
        }

        res.status(200).json({
            code: "S",
            message: "Successfully liked.",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
