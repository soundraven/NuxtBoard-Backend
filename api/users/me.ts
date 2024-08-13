import express, { Request, Response } from "express"
import { ApiResponse } from "../structure/interface"
import camelcaseKeys from "camelcase-keys"
const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        code: "S",
        message: "User authenticated",
        user: camelcaseKeys(res.locals.validatedUser.user),
        accessToken: res.locals.validatedUser.token,
    } as ApiResponse)
})

export default router
