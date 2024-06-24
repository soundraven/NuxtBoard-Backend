import { Request, Response, NextFunction } from "express"

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" })
    }

    //이후 토큰 방식 구현시 관련 로직 작성

    next()
}
