import jwt from "jsonwebtoken"
import { UserInfo } from "../structure/interface"
import dotenv from "dotenv"

dotenv.config()

export function generateToken(
    user: UserInfo,
    expiresInSeconds: number,
    tokenType: "access" | "refresh"
): string {
    if (!process.env.JWT_SECRET) {
        throw new Error(
            "JWT secret key is not defined in the environment variables"
        )
    }

    const payload = {
        id: user.id,
        userName: user.userName,
        type: tokenType,
    }

    const token: string = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: expiresInSeconds,
    })

    return token
}

export async function checkRefreshToken(refreshToken: string) {}

export const refreshTokenExpires: number =
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
export const accessTokenExpires: number =
    Math.floor(Date.now() / 1000) + 60 * 15
