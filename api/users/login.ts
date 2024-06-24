import express, { Request, Response } from "express"
import Userinfo from "../structure/userinfo"

const router = express.Router()

const rightEmail = "1q2w3e4r@gmail.com"
const rightPassword = "1q2w3e4r"

router.post("/login", (req: Request, res: Response) => {
    const userinfo: Userinfo = req.body
    if (userinfo.email === rightEmail && userinfo.password === rightPassword) {
        res.status(200).json({ message: "success" })
    } else {
        res.status(401).json({ message: "fail" })
    }
})

export default router
