import express, { Request, Response } from "express"
import { GeneralServerResponse, LikedHistory } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

const router = express.Router()

router.post(["/like", "/dislike"], async (req: Request, res: Response) => {
  if (!connection) {
    return errorHandler(res, "Database connection not available")
  }

  try {
    if (res.locals.validatedUser.user.id !== req.body.user.id) {
      return errorHandler(res, "Validation failed", 401)
    }

    const postId = req.body.postId
    const userId = res.locals.validatedUser.user.id
    const action = req.path === "/like" ? "like" : "dislike"

    // 현재 추천/비추천 상태 조회
    const [likedHistoryResult] = await connection.query<RowDataPacket[]>(
      `SELECT liked, disliked FROM like_info WHERE post_id = ? AND registered_by = ?`,
      [postId, userId]
    )

    const likedHistory = likedHistoryResult[0] as LikedHistory | undefined

    if (action === "like" && likedHistory?.liked === 1) {
      return errorHandler(res, "Already liked", 409)
    }

    if (action === "dislike" && likedHistory?.disliked === 1) {
      return errorHandler(res, "Already disliked", 409)
    }

    if (likedHistory) {
      if (action === "like") {
        await connection.query(
          `UPDATE like_info SET liked = 1 WHERE post_id = ? AND registered_by = ?`,
          [postId, userId]
        )
      } else {
        await connection.query(
          `UPDATE like_info SET disliked = 1 WHERE post_id = ? AND registered_by = ?`,
          [postId, userId]
        )
      }
    } else {
      await connection.query(
        `INSERT INTO like_info (post_id, registered_by, liked, disliked) VALUES (?, ?, ?, ?)`,
        [
          postId,
          userId,
          action === "like" ? 1 : 0,
          action === "dislike" ? 1 : 0,
        ]
      )
    }

    res.status(200).json({
      success: true,
      message: `Successfully ${action}d.`,
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
