import { VercelRequest, VercelResponse } from "@vercel/node"

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.setHeader("Access-Control-Allow-Credentials", true)
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,OPTIONS,PATCH,DELETE,POST,PUT"
    )

    //아이디가 중복되지 않는지 DB에서 체크하는 쿼리문
    // if (이메일중복) {
    //     res.status(400).json({ message: "email already exist" })
    // }
    res.status(200).json({ message: "success" })
}
