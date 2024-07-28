import express, { Request, Response } from "express"
import {
    ApiResponse,
    GroupedPost,
    Postinfo,
    CountResult,
} from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import dayjs, { Dayjs } from "dayjs"

dotenv.config()

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const { currentPage, pageSize } = req.query as {
        currentPage: string
        pageSize: string
    }

    const currentPageNum = parseInt(currentPage) - 1 //프론트에선 현재 페이지 1 기준 시작
    const pageSizeNum = parseInt(pageSize)

    const listSize = currentPageNum * pageSizeNum

    const getPostList = `SELECT 
        post.*,
        boardinfo.board_id AS boardinfo_board_id,
        boardinfo.board_name
    FROM 
        post
    LEFT JOIN 
        boardinfo ON post.board_id = boardinfo.board_id
    ORDER BY
        post.id DESC
    LIMIT ?,?`

    const getCount = `
        SELECT COUNT(*) as totalPosts
        FROM post
    `

    try {
        const [postListResult] = await connection.execute<RowDataPacket[]>(
            getPostList,
            [listSize, pageSizeNum]
        )

        const [countResult] = await connection.query<RowDataPacket[]>(getCount)

        const postList = postListResult as Postinfo[]

        const groupedPost: GroupedPost = postList.reduce(
            (acc: GroupedPost, post: Postinfo) => {
                const key: number = post.board_id
                if (!acc[key]) {
                    acc[key] = []
                }

                acc[key].push(post)
                return acc
            },
            {}
        )

        Object.keys(groupedPost).forEach((key: string) => {
            const numberKey = Number(key)

            groupedPost[numberKey] = groupedPost[numberKey].map(
                (item: Postinfo) => {
                    return {
                        ...item,
                        formatted_date: dayjs(item.registered_date).format(
                            "YYYY-MM-DD HH:mm:ss"
                        ),
                    }
                }
            )
        })

        const totalCount: number = countResult[0].totalPosts

        res.status(200).json({
            code: "S",
            message: "Successfully get list of posts",
            postList: postList,
            totalCount: totalCount,
            groupedPost: groupedPost,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
