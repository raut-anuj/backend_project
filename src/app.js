// All 3 packets are used in this projects
// mongoose
// exprees
// .env 
//Here express is used to make apps
import express from "express";
import cors from 'cors'
import cookieParser from "cookie-parser"
const app=express();
app.use(cors({
    //This tells the server which website is allowed to send requests.
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))
// express.json() —
// This built-in middleware in Express helps your app understand JSON data coming in from the client
app.use(express.json({
    limit:"16kb"//This sets a maximum size for the incoming JSON data
}))


//This middleware helps your app read form data — the kind that comes from HTML forms (like when you submit <form> on a webpage).
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"))
app.use(cookieParser())

//routes import 

import userRouter from "./routes/user.routes.js";

//routes decleration
app.use("/api/v1/users",userRouter)

//user as a prefix kaam kr rha ha
//https://localhost:8000/api/v1/users/login   (yha ph login jb aye gh toh woh user.routes.js mh jaye gh)
//https://localhost:8000/api/v1/users/register   (yha ph register jb aye gh toh woh user.routes.js mh jaye gh)





export {app}
//This tells Express to serve static files (like images, CSS, JavaScript, PDFs, etc.) from a folder named “public”.