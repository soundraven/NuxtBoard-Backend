import express, { Request, Response } from "express"
import { ApiResponse, PostInfo } from "../structure/interface"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import {
    convertArrayToCamelcase,
    convertToCamelcase,
} from "../utils/convertToCamelcase"
import dayjs from "dayjs"

dotenv.config()

const router = express.Router()

router.get("/:id", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    const postId = req.params.id

    try {
        const [postInfo, likeInfo] = await Promise.all([
            connection.execute<RowDataPacket[]>(
                `SELECT 
                    post.*,
                    board_info.board_name,
                    user_info.user_name AS registered_by_user_name
                FROM 
                    post
                LEFT JOIN 
                    board_info ON post.board_id = board_info.board_id
                LEFT JOIN
                    user_info ON post.registered_by = user_info.id
                WHERE
                    post.id = ?`,
                [postId]
            ),
            connection.execute<RowDataPacket[]>(
                `SELECT 
                    SUM(liked) AS total_likes, SUM(disliked) AS total_dislikes
                FROM 
                    like_info 
                WHERE 
                    post_id = ?`,
                [postId]
            ),
        ])

        const postInfoWithFormattedDate = postInfo[0].map((postInfo) => {
            return {
                ...postInfo,
                formatted_date: dayjs(postInfo.registered_date).format(
                    "YYYY-MM-DD HH:mm:ss"
                ),
            }
        })

        const [camelcasePostInfo] = convertArrayToCamelcase(
            postInfoWithFormattedDate
        )
        const camelcaseLikeInfo = convertToCamelcase(likeInfo[0][0])
        console.log(camelcasePostInfo)

        res.status(200).json({
            code: "S",
            message: "Successfully get list of posts",
            postInfo: camelcasePostInfo,
            likeInfo: camelcaseLikeInfo,
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
