import express, { Request, Response } from "express"
import {
    GeneralServerResponse,
    LikeInfo,
    PostInfo,
} from "../structure/interface"
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
        return errorHandler(res, "Database connection not available")
    }

    const postId = req.params.id

    try {
        const [postInfoResult, likeInfoResult] = await Promise.all([
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

        const postInfo = convertToCamelcase(postInfoResult[0][0]) as PostInfo

        const postInfoWithFormattedDate: PostInfo = {
            ...postInfo,
            formattedDate: dayjs(postInfo.registeredDate).format(
                "YYYY-MM-DD HH:mm:ss"
            ),
        }

        const likeInfo = convertToCamelcase(likeInfoResult[0][0]) as LikeInfo

        res.status(200).json({
            success: true,
            message: "Successfully get list of posts",
            data: {
                postInfo: postInfoWithFormattedDate,
                likeInfo: likeInfo,
            },
        } as GeneralServerResponse<{ postInfo: PostInfo; likeInfo: LikeInfo }>)
    } catch (error) {
        return errorHandler(res, "An unexpected error occurred.", 500, error)
    }
})

export default router
