import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

const corsOpts = {
    origin : '*',
    methods:[
        'GET',
        'POST',
        'DELETE',
        'PUT'
    ],
    allowedHeaders:[
        'Content-Type',
        'x-auth-token'
    ]
}

app.use(cors(corsOpts))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import postRouter from './routes/post.routes.js'


//routes declaration
app.use("/api/v1/user", userRouter)
app.use("/api/v1/post", postRouter)


export { app }