import express from "express"
import { pool } from "../index"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { BoardInfo, GeneralServerResponse } from "../structure/interface"
import { RowDataPacket } from "mysql2"
import { convertArrayToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()
const router = express.Router()

router.get("/", async (req, res) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  try {
    const [boardInfoResult] = await pool.query<BoardInfo[] & RowDataPacket[]>(
      "SELECT board_id, board_name FROM board_info WHERE active = 1"
    )

    const boardInfo = convertArrayToCamelcase(boardInfoResult)

    res.status(200).json({
      success: true,
      message: "Successfully get list of boards",
      data: {
        boardInfo: boardInfo,
      },
    } as GeneralServerResponse<{ boardInfo: BoardInfo[] }>)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
