import { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization")

    if (req.body.email === rightEmail && req.body.password === rightPassword) {
        res.status(200).json({ result: "success" })
    } else {
        res.status(500).json({ result: "fail" })
    }
}

const rightEmail = "1q2w3e4r@gmail.com"
const rightPassword = "1q2w3e4r"
