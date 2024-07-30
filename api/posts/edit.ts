// export async function postUpdateAPI(req, res) {
//     const { boardName, title, content, id, registeredBy } = req.body

//     const update =
//         "UPDATE post SET board_id = ?, title = ?, content = ? WHERE id = ?"

//     try {
//         const result = await connection.query(update, [
//             boardName,
//             title,
//             content,
//             id,
//         ])
//         res.status(200).send()
//     } catch (err) {
//         res.status(500).send(err)
//     }
// }

import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"

const router = express.Router()

router.post("/", async (req: Request, res: Response) => {
    if (!connection) {
        return errorHandler(res, new Error("Database connection not available"))
    }

    if (res.locals.user.id !== req.body.user.id) {
        res.status(500).send("validate fail")
    }

    const postinfo = req.body.post
    const registeredBy = res.locals.validatedUser

    const edit = `UPDATE post SET (board_id, title, content, registered_by) 
        VALUES (?, ?, ?, ?)`

    try {
        const result = await connection.query(edit, [
            postinfo.boardId,
            postinfo.title,
            postinfo.content,
            registeredBy,
        ])

        res.status(200).json({
            code: "S",
            message: "Successfully edited",
        } as ApiResponse)
    } catch (error) {
        errorHandler(res, error)
    }
})

export default router
