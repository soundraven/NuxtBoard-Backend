import { Request, Response, NextFunction } from "express"
import pool from "../config/dbPool"

declare module "express-serve-static-core" {
    interface Request {
        db?: typeof pool
    }
}

const dbMiddleware = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        req.db = pool
        next()
    }
}

export default dbMiddleware
