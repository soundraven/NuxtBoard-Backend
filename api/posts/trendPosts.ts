import express, { Request, Response } from "express"
import { connection } from "../index"
import { errorHandler } from "../utils/errorhandler"
import { RowDataPacket } from "mysql2"
import dayjs from "dayjs"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        // 현재 날짜 기준으로 7일 전 날짜 계산
        const sevenDaysAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD")

        const getTopLikedPostsQuery = `
            SELECT 
                post_id
            FROM 
                like_info
            WHERE 
                registered_date >= ?
            GROUP BY 
                post_id
            ORDER BY 
                SUM(liked) DESC
            LIMIT 5
        `

        const [result] = await connection.execute<RowDataPacket[]>(
            getTopLikedPostsQuery,
            [sevenDaysAgo]
        )

        const trendPosts = result.map((row) => row.post_id)

        const getPostDetailsQuery = `
            SELECT 
                id, title, registered_date
            FROM 
                post
            WHERE 
                id IN (?)
        `

        const [postDetailsResult] = await connection.execute<RowDataPacket[]>(
            getPostDetailsQuery,
            [trendPosts]
        )

        const trendPostsDetails = postDetailsResult.map((row) => ({
            id: row.id,
            title: row.title,
            registeredDate: row.registered_date,
        }))

        res.status(200).json({
            code: "S",
            message: "Successfully fetched top liked posts",
            trendPosts: trendPostsDetails,
        })
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
