import express, { Request, Response } from "express"
import path from "path"
import { errorHandler } from "../utils/errorhandler"

const router = express.Router()

router.get("/:filename", (req: Request, res: Response) => {
  const filename = req.params.filename
  const filePath = path.join(process.cwd(), "uploads", filename)

  res.download(filePath, filename, (err) => {
    if (err) {
      return errorHandler(res, "File download failed", 500, err)
    }
  })
})

export default router
