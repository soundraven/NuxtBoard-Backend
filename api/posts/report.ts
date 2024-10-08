import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"
import { RowDataPacket } from "mysql2"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  try {
    if (res.locals.validatedUser.user.id !== req.body.user.id) {
      return errorHandler(res, "Validation failed.", 401)
    }

    const postId = req.body.postId
    const reportedBy = res.locals.validatedUser.user.id

    const [checkHistory] = await pool.query<RowDataPacket[]>(
      `SELECT * FROM report WHERE post_id = ? AND reported_by = ?`,
      [postId, reportedBy]
    )

    if (checkHistory.length > 0) {
      return errorHandler(res, "Already reported this post.", 409)
    }

    await Promise.all([
      pool.query(`INSERT INTO report (post_id, reported_by) VALUES (?, ?)`, [
        postId,
        reportedBy,
      ]),
      pool.query(`UPDATE post SET report = report + 1 WHERE id = ?`, [postId]),
    ])

    const [reportCount] = await pool.query<RowDataPacket[]>(
      `SELECT report FROM post WHERE id = ?`,
      [postId]
    )

    if (reportCount[0].report >= 5) {
      await pool.query<RowDataPacket[]>(
        `UPDATE post SET active = 0 WHERE id = ?`,
        [postId]
      )

      return res.status(200).json({
        success: true,
        message: "Post successfully deleted by report",
      } as GeneralServerResponse)
    }

    return res.status(200).json({
      success: true,
      message:
        "Post successfully reported. If a post receives 5 reports, it will be automatically deleted.",
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
