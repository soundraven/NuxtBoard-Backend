import { Request, Response, NextFunction } from "express"
import { connection } from "../index"

const dbMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (connection) {
            ;(req as any).db = connection
            next()
        } else {
            res.status(500).json({
                message: "Database connection not available",
            })
        }
    }
}

export default dbMiddleware
