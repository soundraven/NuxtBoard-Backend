import { Response } from "express"

export const errorHandler = (
    res: Response,
    message: string,
    statusCode: number = 500
): Response => {
    console.error("Error:", message)

    return res.status(statusCode).json({
        success: false,
        message: message,
    })
}
