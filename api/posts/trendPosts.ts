import express, { Request, Response } from "express"
import { connection } from "../index"
import { errorHandler } from "../utils/errorhandler"
import { RowDataPacket } from "mysql2"
import dayjs from "dayjs"
import { GeneralServerResponse, PostInfo } from "../structure/interface"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, "Database connection not available")
    }

    try {
        const sevenDaysAgo = dayjs().subtract(7, "day").format("YYYY-MM-DD")
        const { boardId } = req.query

        let getTrendPostsQuery = `
            SELECT 
                p.id as post_id
            FROM 
                post p
            JOIN 
                like_info li ON p.id = li.post_id
            WHERE
                p.registered_date >= ?
            GROUP BY 
                p.id
            ORDER BY 
                SUM(li.liked) DESC
            LIMIT 5
        `

        const [trendPostsResult] = await connection.execute<RowDataPacket[]>(
            getTrendPostsQuery,
            [sevenDaysAgo]
        )

        const trendPosts = trendPostsResult.map((row) => row.post_id)
        const trendPostsDetails = []

        for (const postId of trendPosts) {
            const [postDetailsResult] = await connection.execute<
                RowDataPacket[]
            >(
                `
                SELECT 
                    id, title, registered_date
                FROM 
                    post
                WHERE 
                    id = ?
                `,
                [postId]
            )

            if (postDetailsResult.length > 0) {
                const postDetail = postDetailsResult[0]
                trendPostsDetails.push({
                    id: postDetail.id,
                    title: postDetail.title,
                    registeredDate: postDetail.registered_date,
                })
            }
        }

        let currentBoardTrendQuery = `
            SELECT 
                post.id
            FROM 
                post
            JOIN 
                like_info ON post.id = like_info.post_id
            WHERE
                post.registered_date >= ? AND post.board_id = ?
            GROUP BY 
                post.id
            ORDER BY 
                SUM(like_info.liked) DESC
            LIMIT 5
        `

        let currentBoardTrendDetails = []
        if (boardId) {
            const [currentBoardTrendResult] = await connection.execute<
                RowDataPacket[]
            >(currentBoardTrendQuery, [sevenDaysAgo, boardId])

            const currentBoardTrendPosts = currentBoardTrendResult.map(
                (row) => row.id
            )

            for (const postId of currentBoardTrendPosts) {
                const [postDetailsResult] = await connection.execute<
                    RowDataPacket[]
                >(
                    `
                    SELECT
                        id, title, registered_date
                    FROM
                        post
                    WHERE
                        id = ?
                    `,
                    [postId]
                )

                if (postDetailsResult.length > 0) {
                    const postDetail = postDetailsResult[0]
                    currentBoardTrendDetails.push({
                        id: postDetail.id,
                        title: postDetail.title,
                        registeredDate: postDetail.registered_date,
                    })
                }
            }
        }

        res.status(200).json({
            success: true,
            message: "Successfully fetched top liked posts",
            data: {
                trendPosts: trendPostsDetails,
                currentBoardTrendPosts: currentBoardTrendDetails,
            },
        } as GeneralServerResponse<{ trendPosts: PostInfo[]; currentBoardTrendPosts: PostInfo[] }>)
    } catch (error) {
        errorHandler(res, "An unexpected error occurred.")
    }
})

export default router
