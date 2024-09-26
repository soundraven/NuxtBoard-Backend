import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  if (res.locals.validatedUser.user.id !== req.body.user.id) {
    return errorHandler(res, "Validation failed", 401)
  }

  try {
    const commentId = req.body.commentId

    await pool.query(`UPDATE comment SET active = 0 WHERE id = ?`, [commentId])

    res.status(200).json({
      success: true,
      message: "Comment successfully deleted",
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
