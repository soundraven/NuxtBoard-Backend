import express from "express"
import cors from "cors"
import mysql, { Pool } from "mysql2/promise"
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
import uploadRoute from "./posts/upload"
import downloadRoute from "./posts/download"

import myCommentListRoute from "./comments/myCommentList"
import commentInfoRoute from "./comments/commentList"
import commentWriteRoute from "./comments/write"
import commentEditRoute from "./comments/edit"
import commentDeleteRoute from "./comments/delete"

import validateToken from "./middlewares/validateToken"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

const startServer = () => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on port ${process.env.PORT || 8000}`)
  })
}

export let pool: Pool | null = null

async function connectToDatabase() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      connectionLimit: 50,
    })

    const connection = await pool.getConnection()
    console.log("Connected to MySQL database")
    connection.release()
  } catch (error) {
    console.error("Failed to connect to MySQL. Retrying in 5 seconds...", error)
    setTimeout(connectToDatabase, 5000)
  }
}

startServer()
connectToDatabase()

app.use("/api/posts/list", postListRoute)
app.use("/api/posts/postInfo", postInfoRoute)
app.use("/api/comments/commentList", commentInfoRoute)
app.use("/api/users/login", loginRoute)
app.use("/api/users/register", registerRoute)
app.use("/api/users/refreshAccessToken", refreshAccessTokenRoute)
app.use("/api/posts/boardInfo", boardInfoRoute)
app.use("/api/posts/trendPosts", trendPostsRoute)
app.use("/api/posts/upload", uploadRoute)
app.use("/api/posts/download", downloadRoute)

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
