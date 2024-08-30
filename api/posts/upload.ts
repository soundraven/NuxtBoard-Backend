import express, { Request, Response } from "express"
import dotenv from "dotenv"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import { convertToCamelcase } from "../utils/convertToCamelcase"
import dayjs from "dayjs"
import multer from "multer"
import path from "path"

// 환경 변수 설정
dotenv.config()

const router = express.Router()

// Multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "uploads")) // 파일이 저장될 디렉터리
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`) // 파일명을 현재 시간과 원본 이름으로 설정
    },
})

const upload = multer({ storage: storage })

router.post("/", upload.array("file", 10), (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[]
        if (!files || files.length === 0) {
            return res.status(400).json({ message: "No files were uploaded." })
        }

        // 파일 URL 생성
        const fileUrls = files.map((file) => {
            const url = `${req.protocol}://${req.get("host")}/uploads/${
                file.filename
            }`
            return {
                originalName: file.originalname,
                url: url,
            }
        })

        // 파일이 성공적으로 업로드되었음을 응답
        res.status(200).json({
            message: "File(s) uploaded successfully",
            files: fileUrls,
        })
    } catch (error) {
        return errorHandler(res, "File upload failed", 500, error)
    }
})

export default router
