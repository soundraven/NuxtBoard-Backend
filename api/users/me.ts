import express, { Request, Response } from "express"
import { GeneralServerResponse, UserInfo } from "../structure/interface"
import { convertToCamelcase } from "../utils/convertToCamelcase"

const router = express.Router()

router.get("/", async (req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: "User authenticated",
        data: {
            user: convertToCamelcase<UserInfo>(res.locals.validatedUser.user),
            accessToken: res.locals.validatedUser.token,
        },
    } as GeneralServerResponse<{ user: UserInfo; accessToken: string }>)
})

export default router
