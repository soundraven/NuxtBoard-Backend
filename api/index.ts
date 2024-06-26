import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"
import mysql from "mysql2/promise"

import dbMiddleware from "./config/dbPool"

import loginRoute from "./users/login"
import registerRoute from "./users/register"

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
})

app.use(dbMiddleware(pool))

app.use("/api/users", loginRoute)
app.use("/api/users", registerRoute)

export default app
