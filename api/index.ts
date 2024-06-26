import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"
import mysql from "mysql2/promise"
import dotenv from "dotenv"

import dbMiddleware from "./middlewares/dbMiddleware"

import loginRoute from "./users/login"
import registerRoute from "./users/register"

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

app.use(dbMiddleware())

app.use("/api/users", loginRoute)
app.use("/api/users", registerRoute)

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

export default app
