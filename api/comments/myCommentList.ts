import express, { Request, Response } from "express"
import { CommentInfo, GeneralServerResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import { convertArrayToCamelcase } from "../utils/convertToCamelcase"
import dayjs from "dayjs"
import utc from "dayjs/plugin/utc"
import timezone from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(timezone)

dotenv.config()

const router = express.Router()

router.get("/:registeredBy", async (req: Request, res: Response) => {
  if (!connection) {
    return errorHandler(res, "Database connection not available")
  }

  try {
    const registeredBy = req.params.registeredBy

    const [commentList] = await connection.query<RowDataPacket[]>(
      `SELECT 
                comment.*
            FROM 
                comment
            WHERE
                registered_by = ?`,
      [registeredBy]
    )

    const camelcaseCommentList = convertArrayToCamelcase(
      commentList
    ) as CommentInfo[]

    const commentListWithFormattedDate = camelcaseCommentList.map(
      (commentList) => {
        return {
          ...commentList,
          formattedDate: dayjs(commentList.registeredDate)
            .tz("Asia/Seoul")
            .format("YYYY-MM-DD HH:mm:ss"),
        }
      }
    )

    res.status(200).json({
      success: true,
      message: "Successfully get list of comments",
      data: { commentList: commentListWithFormattedDate },
    } as GeneralServerResponse<{ commentList: CommentInfo[] }>)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
