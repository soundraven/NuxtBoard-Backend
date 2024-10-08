import express, { Request, Response } from "express"
import { GeneralServerResponse, NewUser } from "../structure/interface"
import crypto from "crypto"
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

  try {
    const newUser: NewUser = req.body.user

    if (!newUser.email || !newUser.password) {
      return errorHandler(res, "UserInfo not exist", 400)
    }

    const encryptedPassword: string = crypto
      .createHash("sha256")
      .update(newUser.password + process.env.PWSALT)
      .digest("hex")

    const [result] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(email) AS count FROM user_info WHERE email = ?`,
      [newUser.email]
    )

    if (result[0].count > 0) {
      return errorHandler(res, "Email already exist.", 409)
    }

    await pool.query(
      `INSERT INTO user_info (email, password, user_name) VALUES (?, ?, ?)`,
      [newUser.email, encryptedPassword, newUser.userName]
    )

    res.status(200).json({
      success: true,
      message: "Registration success.",
    } as GeneralServerResponse)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
