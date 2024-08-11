import jwt from "jsonwebtoken"
import { UserInfo } from "../structure/interface"
import dotenv from "dotenv"

dotenv.config()

export async function generateToken(
    user: UserInfo,
    expiresInSeconds: number,
    tokenType: "access" | "refresh"
): Promise<string> {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT secret key is not defined in the environment variables"
        )
    }

    const payload = {
        id: user.id,
        username: user.username,
        type: tokenType,
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: expiresInSeconds,
    })

    return token
}
