import { Request, Response, NextFunction } from "express"
import { Pool } from "mysql2/promise"

declare module "express-serve-static-core" {
    interface Request {
        db?: Pool
    }
}

const dbMiddleware = (pool: Pool) => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.db = pool
        next()
    }
}

export default dbMiddleware
