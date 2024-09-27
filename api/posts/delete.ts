import express, { Request, Response } from "express"
import {} from "../structure/interface"
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

  const postId = req.body.postId

  try {
    await pool.query(`UPDATE post SET active = 0 WHERE id = ?`, [postId])

    res.status(200).json({
      success: true,
      message: "Post successfully deleted",
    })
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
