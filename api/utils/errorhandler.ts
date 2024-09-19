import { Response } from "express"

export const errorHandler = (
  res: Response,
  message: string,
  statusCode: number = 500,
  error?: any
): Response => {
  console.error("Error:", message)
  if (error) {
    console.error("Detailed Error:", error)
  }

  return res.status(statusCode).json({
    success: false,
    message: message,
    error: error?.message || undefined,
  })
}
