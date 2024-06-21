import { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Credentials", true)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    )

    if (req.body.email === rightEmail && req.body.password === rightPassword) {
        res.status(200).json({ message: "success" })
    } else {
        res.status(401).json({ message: "fail" })
    }
}

const rightEmail = "1q2w3e4r@gmail.com"
const rightPassword = "1q2w3e4r"
