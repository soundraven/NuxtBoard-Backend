import express from "express"
import { connection } from "../index"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { ApiResponse, BoardInfo } from "../structure/interface"
import { RowDataPacket } from "mysql2"
import { convertArrayToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()
const router = express.Router()

router.get("/", async (req, res) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        const [boardInfo] = await connection.execute<
            BoardInfo[] & RowDataPacket[]
        >("SELECT board_id, board_name FROM board_info WHERE active = 1")
        const camelcaseBoardInfo = convertArrayToCamelcase(
            boardInfo
        ) as BoardInfo[]

        res.status(200).json({
            code: "S",
            message: "Successfully get list of boards",
            boardInfo: camelcaseBoardInfo,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
