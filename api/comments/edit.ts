import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  const { comment, reply, commentId, replyId } = req.body

  if (commentId) {
    try {
      await pool.query(`UPDATE comment SET content = ? WHERE id = ?`, [
        comment,
        commentId,
      ])

      return res.status(200).json({
        success: true,
        message: "Successfully edited",
      } as GeneralServerResponse)
    } catch (error) {
      errorHandler(res, "An unexpected error occurred.")
    }
  }

  try {
    await pool.query(`UPDATE reply SET content = ? WHERE id = ?`, [
      reply,
      replyId,
    ])

    return res.status(200).json({
      success: true,
      message: "Successfully edited",
    })
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
