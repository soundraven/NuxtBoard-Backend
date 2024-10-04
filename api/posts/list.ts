import express, { Request, Response } from "express"
import {
  GeneralServerResponse,
  GroupedPost,
  PostInfo,
} from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { pool } from "../index"
import { RowDataPacket } from "mysql2"
import dayjs from "dayjs"
import { convertArrayToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
  if (!pool) {
    return errorHandler(res, "Database pool not available")
  }

  try {
    const { currentPage, pageSize, registeredBy, boardId } = req.query as {
      currentPage: string
      pageSize: string
      registeredBy: string
      boardId: string | undefined
    }

    const currentPageNum = parseInt(currentPage) - 1
    const pageSizeNum = parseInt(pageSize)
    const registeredByNum = registeredBy ? parseInt(registeredBy) : null
    const boardIdNum = boardId ? parseInt(boardId) : null
    const listSize: number = currentPageNum * pageSizeNum

    let getPostList = `
        SELECT
            post.*,
            board_info.board_id AS board_id,
            board_info.board_name,
            user_info.user_name AS registeredUserName
        FROM 
            post
        LEFT JOIN 
            board_info ON post.board_id = board_info.board_id
        LEFT JOIN
            user_info ON post.registered_by = user_info.id
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

    if (boardIdNum !== null && !isNaN(boardIdNum)) {
      getPostList += ` AND post.board_id = ? `
      getCount += ` AND post.board_id = ? `
      params.push(boardIdNum)
    }

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

    const [postListResult] = await pool.query<RowDataPacket[]>(
      getPostList,
      params
    )

    const [countResult] = await pool.query<RowDataPacket[]>(
      getCount,
      params.slice(0, -2)
    )

    const postList = convertArrayToCamelcase<PostInfo>(
      postListResult as PostInfo[]
    )

    const postListWithFormattedDate = postList.map((post) => {
      const formattedDate = dayjs(post.registeredDate).format(
        "YYYY-MM-DD HH:mm:ss"
      )

      return {
        ...post,
        formattedDate,
      }
    })

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
        formattedDate: dayjs(item.registeredDate).format("YYYY-MM-DD HH:mm:ss"),
      }))
    })

    const totalCount = countResult[0].totalPosts

    res.status(200).json({
      success: true,
      message: "Successfully get list of posts",
      data: {
        postList: postListWithFormattedDate,
        totalCount: totalCount,
        groupedPost: groupedPost,
      },
    } as GeneralServerResponse<{ postList: PostInfo[]; totalCount: number; groupedPost: GroupedPost }>)
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
})

export default router
