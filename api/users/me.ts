import express, { Request, Response } from "express"
import { ApiResponse, UserInfo } from "../structure/interface"
import convertToCamelcase from "../utils/convertToCamelcase"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        code: "S",
        message: "User authenticated",
        user: convertToCamelcase<UserInfo>(res.locals.validatedUser.user),
        accessToken: res.locals.validatedUser.token,
    } as ApiResponse)
})

export default router
