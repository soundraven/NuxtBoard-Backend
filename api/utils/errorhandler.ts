import { Response } from "express"

export const errorHandler = (res: Response, error: unknown): void => {
    if (error instanceof Error) {
        console.error("Error:", error.message)
        res.status(500).json({
            code: "F",
            message: "known Error occurred",
            error: error.message,
        })
    } else {
        console.error("Unknown error occurred")
        res.status(500).json({
            code: "F",
            message: "Unknown error occurred",
            error: "Unknown error",
        })
    }
}
