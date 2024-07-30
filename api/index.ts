import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"
import mysql, { Connection } from "mysql2/promise"
import dotenv from "dotenv"

import loginRoute from "./users/login"
import registerRoute from "./users/register"
import autoLoginRoute from "./users/me"
import deactivateRoute from "./users/deactive"

import postListRoute from "./posts/list"
import postinfoRoute from "./posts/postinfo"
import postWriteRoute from "./posts/write"
import postEditRoute from "./posts/edit"
import postDeleteRoute from "./posts/delete"

import commentListRoute from "./comments/list"
import commentinfoRoute from "./comments/postinfo"
import commentWriteRoute from "./comments/write"
import commentEditRoute from "./comments/edit"
import commentDeleteRoute from "./comments/delete"

import validateToken from "./middlewares/validateToken"

dotenv.config()

const app = express()

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use(express.json())

app.listen(process.env.DB_PORT, () => {
    console.log(`open server ${process.env.DB_PORT}`)
})

export let connection: Connection | null = null

async function startServer() {
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        })

        console.log("DB Connection success")
    } catch (error) {
        console.error("DB Connection failed:", error)
    }
}

startServer()

app.use("/api/validate", validateToken)

app.use("/api/posts/list", postListRoute)
app.use("/api/posts/postinfo", postinfoRoute)
app.use("/api/comments/list", commentListRoute)
app.use("/api/comments/postinfo", commentinfoRoute)

app.use("/api/users/login", loginRoute)
app.use("/api/users/register", registerRoute)

app.use(validateToken)
app.use("/api/users/deactivate", deactivateRoute)
app.use("/api/users/me", autoLoginRoute)
app.use("/api/posts/write", postWriteRoute)
app.use("/api/posts/edit", postEditRoute)
app.use("/api/posts/delete", postDeleteRoute)
app.use("/api/comments/write", commentWriteRoute)
app.use("/api/comments/edit", commentEditRoute)
app.use("/api/comments/delete", commentDeleteRoute)

export default app
