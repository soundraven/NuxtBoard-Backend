import { Response } from "express"

export const errorHandler = (res: Response, error: unknown): void => {
    if (error instanceof Error) {
        console.error("Error:", error.message)
        res.status(400).json({
            message: "Error occurred",
            error: error.message,
        })
    } else {
        console.error("Unknown error occurred")
        res.status(500).json({
            message: "Unknown error occurred",
            error: "Unknown error",
        })
    }
}
