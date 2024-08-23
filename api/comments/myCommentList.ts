import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import { convertArrayToCamelcase } from "../utils/convertToCamelcase"
import dayjs from "dayjs"

dotenv.config()

const router = express.Router()

router.get("/:registeredBy", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        const registeredBy = req.params.registeredBy

        const [commentList] = await connection.execute<RowDataPacket[]>(
            `SELECT 
            comment.*
        FROM 
            comment
        WHERE
            registered_by = ?`,
            [registeredBy]
        )

        const camelcaseCommentList = convertArrayToCamelcase(commentList)

        const commentListWithFormattedDate = camelcaseCommentList.map(
            (commentList) => {
                return {
                    ...commentList,
                    formattedDate: dayjs(commentList.registeredDate).format(
                        "YYYY-MM-DD HH:mm:ss"
                    ),
                }
            }
        )

        res.status(200).json({
            code: "S",
            message: "Successfully get list of comments",
            commentList: commentListWithFormattedDate,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
