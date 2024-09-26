import express, { Request, Response } from "express"
import { GeneralServerResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  if (res.locals.validatedUser.user.id !== req.body.user.id) {
    return errorHandler(res, "Validation failed.", 401)
  }

  try {
    const { user, userName } = req.body

    await pool.query<RowDataPacket[]>(
      `UPDATE user_info SET user_name = ? WHERE id = ?`,
      [userName, user.id]
    )

    res.status(200).json({
      success: true,
      message: "UserName set success.",
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
