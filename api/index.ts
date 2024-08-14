import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"
import mysql, { Connection } from "mysql2/promise"
import dotenv from "dotenv"

import loginRoute from "./users/login"
import registerRoute from "./users/register"
import autoLoginRoute from "./users/me"
import deactivateRoute from "./users/deactive"
import setUsernameRoute from "./users/setUsername"
import refreshAccessTokenRoute from "./users/refreshAccessToken"

import postListRoute from "./posts/list"
import postInfoRoute from "./posts/postInfo"
import postWriteRoute from "./posts/write"
import postEditRoute from "./posts/edit"
import postDeleteRoute from "./posts/delete"
import likesRoute from "./posts/likes"
import reportRoute from "./posts/report"
import boardInfoRoute from "./posts/boardInfo"
import trendPostsRoute from "./posts/trendPosts"

import myCommentListRoute from "./comments/myCommentList"
import commentinfoRoute from "./comments/commentList"
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
        process.exit(1)
    }
}

export let connection: Connection | null = null

startServer()

app.use("/api/posts/list", postListRoute)
app.use("/api/posts/postInfo", postInfoRoute)
app.use("/api/comments/commentList", commentinfoRoute)
app.use("/api/users/login", loginRoute)
app.use("/api/users/register", registerRoute)
app.use("/api/users/refreshAccessToken", refreshAccessTokenRoute)
app.use("/api/posts/boardInfo", boardInfoRoute)
app.use("/api/posts/trendPosts", trendPostsRoute)

app.use(validateToken)
app.use("/api/users/deactivate", deactivateRoute)
app.use("/api/users/me", autoLoginRoute)
app.use("/api/users/setUsername", setUsernameRoute)
app.use("/api/posts/write", postWriteRoute)
app.use("/api/posts/edit", postEditRoute)
app.use("/api/posts/delete", postDeleteRoute)
app.use("/api/posts/likes", likesRoute)
app.use("/api/posts/report", reportRoute)
app.use("/api/comments/write", commentWriteRoute)
app.use("/api/comments/edit", commentEditRoute)
app.use("/api/comments/delete", commentDeleteRoute)
app.use("/api/comments/myCommentList", myCommentListRoute)

export default app
