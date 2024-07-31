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

    const { currentPage, pageSize, registeredBy } = req.query as {
        currentPage: string
        pageSize: string
        registeredBy: string
    }

    const currentPageNum = parseInt(currentPage) - 1 //프론트에선 현재 페이지 1 기준 시작
    const pageSizeNum = parseInt(pageSize)
    const registeredByNum = registeredBy ? parseInt(registeredBy) : null

    const listSize = currentPageNum * pageSizeNum

    let getPostList = `SELECT 
        post.*,
        boardinfo.board_id AS boardinfo_board_id,
        boardinfo.board_name
    FROM 
        post
    LEFT JOIN 
        boardinfo ON post.board_id = boardinfo.board_id
    WHERE 
        post.active = 1
    `

    let getCount = `
        SELECT COUNT(*) as totalPosts
        FROM post
        WHERE post.active = 1
    `

    if (registeredByNum !== null && !isNaN(registeredByNum)) {
        getPostList += ` AND WHERE post.registered_by = ? `
        getCount += ` AND WHERE post.registered_by = ? `
    }

    getPostList += `
    ORDER BY
        post.id DESC
    LIMIT ?,?`

    try {
        const postListParams =
            registeredByNum !== null && !isNaN(registeredByNum)
                ? [registeredByNum, listSize, pageSizeNum]
                : [listSize, pageSizeNum]

        const countParams =
            registeredByNum !== null && !isNaN(registeredByNum)
                ? [registeredByNum]
                : []

        const [postListResult] = await connection.execute<RowDataPacket[]>(
            getPostList,
            postListParams
        )

        const [countResult] = await connection.query<RowDataPacket[]>(
            getCount,
            countParams
        )

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
