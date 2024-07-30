// export async function postDeleteAPI(req, res) {
//     const id = req.body.id
//     const deletePost = "UPDATE post SET active = 0 WHERE id = ?"
//     try {
//         const result = await connection.query(deletePost, [id])
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
export default router
