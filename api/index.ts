import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"
import mysql, { Connection } from "mysql2/promise"
import dotenv from "dotenv"
import dbMiddleware from "./middlewares/dbMiddleware"

import loginRoute from "./users/login"
import registerRoute from "./users/register"

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use(express.json())

app.use(dbMiddleware())

app.use("/api/users/login", loginRoute)
app.use("/api/users/register", registerRoute)

app.listen(process.env.DB_PORT, () => {
    console.log(`open server ${process.env.DB_PORT}`)
})

export let connection: Connection | null = null

async function startServer() {
    connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
    })

    if (connection != null) {
        console.log("DB Connection success")
    }
}

startServer()

export default app
