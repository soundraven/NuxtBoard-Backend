import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import multer from "multer"
import path from "path"
import { FileUrls, GeneralServerResponse } from "../structure/interface"

dotenv.config()

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads"))
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`)
    },
})

const upload = multer({ storage: storage })

router.post("/", upload.array("file", 10), (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[]
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files were uploaded." })
        }

        const fileUrls = files.map((file) => {
            const url = `${req.protocol}://${req.get("host")}/uploads/${
                file.filename
            }`
            return {
                originalName: file.originalname,
                url: url,
            }
        })

        res.status(200).json({
            success: true,
            message: "File(s) uploaded successfully",
            data: {
                files: fileUrls,
            },
        } as GeneralServerResponse<{ files: FileUrls[] }>)
    } catch (error) {
        return errorHandler(res, "File upload failed", 500, error)
    }
})

export default router
