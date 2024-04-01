import  express, { urlencoded }  from "express";
import cookieParser from "cookie-parser" // used for performing crud operation
import cors from "cors"
const app = express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true,
    
}))

app.use(express.json({limit:"16kb"})) // converting body request to json format and setting up limit how much data upto we accepting
app.use(express.urlencoded({extended:true , limit:"16kb"})) //  parses incoming requests with URL-encoded payloads ,  allows parsing of nested objects
app.use(express.static("public")) // used for storing static file on server
app.use(express.cookieParser())
export default app