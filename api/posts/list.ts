import express, { Request, Response } from "express"
import { ApiResponse, GroupedPost, PostInfo } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import dayjs from "dayjs"
import {
    convertArrayToCamelcase,
    convertToCamelcase,
} from "../utils/convertToCamelcase"

dotenv.config()

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    try {
        const { currentPage, pageSize, registeredBy } = req.query as {
            currentPage: string
            pageSize: string
            registeredBy: string
        }

        const currentPageNum = parseInt(currentPage) - 1 // 프론트에서 현재 페이지 1 기준 시작
        const pageSizeNum = parseInt(pageSize)
        const registeredByNum = registeredBy ? parseInt(registeredBy) : null
        const listSize = currentPageNum * pageSizeNum

        let getPostList = `
        SELECT
            post.*,
            board_info.board_id AS board_id,
            board_info.board_name
        FROM 
            post
        LEFT JOIN 
            board_info ON post.board_id = board_info.board_id
        WHERE 
            post.active = 1`

        let getCount = `
            SELECT
                COUNT(*) as totalPosts
            FROM
                post
            WHERE 
                post.active = 1`

        const params: any[] = []

        if (registeredByNum !== null && !isNaN(registeredByNum)) {
            getPostList += ` AND post.registered_by = ? `
            getCount += ` AND post.registered_by = ? `
            params.push(registeredByNum)
        }

        getPostList += `
        ORDER BY
            post.id DESC
        LIMIT ?,?`

        params.push(listSize, pageSizeNum)

        const [postListResult] = await connection.query<RowDataPacket[]>(
            getPostList,
            params
        )

        const [countResult] = await connection.query<RowDataPacket[]>(
            getCount,
            [registeredByNum].filter(Boolean)
        )

        const postList = convertArrayToCamelcase<PostInfo>(
            postListResult as PostInfo[]
        )

        const groupedPost: GroupedPost = postList.reduce((acc, post) => {
            const key = post.boardId
            if (!acc[key]) {
                acc[key] = []
            }
            acc[key].push(post)
            return acc
        }, {} as Record<number, PostInfo[]>)

        Object.keys(groupedPost).forEach((key) => {
            const numberKey = Number(key)
            groupedPost[numberKey] = groupedPost[numberKey].map((item) => ({
                ...item,
                formatted_date: dayjs(item.registeredDate).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            }))
        })

        const totalCount = countResult[0].totalPosts

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
