import express, { Request, Response } from "express"
import { Userinfo } from "../structure/interface"

const router = express.Router()

router.post("/register", (req: Request, res: Response) => {
    const userinfo: Userinfo = req.body

    if (userinfo.email === rightEmail && userinfo.password === rightPassword) {
        res.status(200).json({ message: "success" })
    } else {
        res.status(401).json({ message: "fail" })
    }
})

export default router
