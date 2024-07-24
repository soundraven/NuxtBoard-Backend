import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"

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
        const [postListResult, countResult] = await Promise.all([
            connection.execute<RowDataPacket[]>(getPostList, [
                listSize,
                pageSizeNum,
            ]),
            connection.query<RowDataPacket[]>(getCount),
        ])

        const [postList] = postListResult

        const groupedPost = postList.reduce((acc: any, post) => {
            const key = post.board_id
            if (!acc[key]) {
                acc[key] = []
            }

            acc[key].push(post)
            return acc
        }, {})

        const [totalPosts] = countResult
        const totalCount: number = (
            totalPosts[0] as {
                totalPosts: number
            }
        ).totalPosts

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
