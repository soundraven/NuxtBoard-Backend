import { Request, Response, NextFunction } from "express"
import { UserInfo } from "../structure/interface"
import { errorHandler } from "../utils/errorhandler"
import { connection } from "../index"
import { RowDataPacket } from "mysql2"
import dotenv from "dotenv"
import jwt from "jsonwebtoken"
import { convertToCamelcase } from "../utils/convertToCamelcase"

dotenv.config()

export default async function validateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!connection) {
    return errorHandler(res, "Database connection not available")
  }

  const token = req.headers["authorization"]?.split(" ")[1] || ""

  if (!token) {
    return errorHandler(res, "Auth failed", 401)
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as jwt.JwtPayload

    const userId = decoded.id

    const [user] = await connection.query<UserInfo[] & RowDataPacket[]>(
      `SELECT id, email, user_name, registered_date, active FROM user_info WHERE id = ?`,
      [userId]
    )

    if (user.length < 1) {
      return errorHandler(res, "User not exist", 404)
    }

    if (user[0].active === 0) {
      return errorHandler(res, "Already resigned user", 410)
    }

    const camelcaseUser = convertToCamelcase<UserInfo>(user[0])

    res.locals.validatedUser = { user: camelcaseUser, token: token }
    next()
  } catch (error) {
    return errorHandler(res, "An unexpected error occurred.", 500, error)
  }
}
