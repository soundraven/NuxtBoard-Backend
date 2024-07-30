import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

dotenv.config()

const router = express.Router()

router.get("/:registeredBy", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const registeredBy = req.params.registeredBy

    const getCommentList = `SELECT 
        comment.*
    FROM 
        comment
    WHERE
        registered_by = ?`

    try {
        const [commentList] = await connection.query<RowDataPacket[]>(
            getCommentList,
            [registeredBy]
        )

        res.status(200).json({
            code: "S",
            message: "Successfully get list of comments",
            commentList: commentList,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
