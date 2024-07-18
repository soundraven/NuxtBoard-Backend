import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    res.json({
        code: "S",
        message: "User authenticated",
        user: res.locals.validatedUser.user,
        token: res.locals.validatedUser.token,
    } as ApiResponse)
})

export default router
