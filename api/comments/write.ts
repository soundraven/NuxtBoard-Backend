import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"
import { ResultSetHeader } from "mysql2"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  const { postId, comment, reply, commentId } = req.body
  const registeredBy = res.locals.validatedUser.user.id

  if (commentId) {
    try {
      const result = await pool.query<ResultSetHeader>(
        `INSERT INTO 
                    reply (post_id, comment_id, content, registered_by) 
                VALUES (?, ?, ?, ?)`,
        [postId, commentId, reply, registeredBy]
      )

      if (result[0].affectedRows < 1) {
        errorHandler(res, "Failed to post.", 500)
      }

      return res.status(200).json({
        success: true,
        message: "Successfully posted",
      } as GeneralServerResponse)
    } catch (error) {
      errorHandler(res, "An unexpected error occurred.")
    }
  }

  try {
    const result = await pool.query<ResultSetHeader>(
      `INSERT INTO 
                comment (post_id, content, registered_by) 
            VALUES (?, ?, ?)`,
      [postId, comment, registeredBy]
    )

    if (result[0].affectedRows < 1) {
      errorHandler(res, "Failed to post.", 500)
    }

    res.status(200).json({
      success: true,
      message: "Successfully posted",
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
