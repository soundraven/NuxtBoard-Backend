import express from "express"
import cors from "cors"
import corsOptions from "./config/corsOptions"

import loginRoute from "./users/login"
import registerRoute from "./users/register"

const app = express()

app.use(cors(corsOptions))
app.use(express.json())

app.use("/api/users", loginRoute)
app.use("/api/users", registerRoute)

export default app
