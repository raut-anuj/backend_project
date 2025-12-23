<<<<<<< HEAD
//require('dotenv').cofig({path:'./env'})
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})
import express from "express";

import { app } from "./app.js";

//const app = express();

// THIS HAS BEEN GIVEN IN INDEX FILE SO REMOVE FROM HERE
// import mongoose from "mongoose"
// import {DB_NAME} from "./contants.js"

//import connection by making another file
import connectDB from "./db/index.js"
console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})





/*
//BETTER APPROACH THEN MAKING FUNCTION
;(async()=>{
    try{
        //DB CONNECT
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    }
    catch(error){
        console.log("Error:",error);
        throw err
        
    }
})()
=======
//require('dotenv').cofig({path:'./env'})
import dotenv from 'dotenv'
dotenv.config({
    path:'./.env'
})
import express from "express";

import { app } from "./app.js";

//const app = express();

// THIS HAS BEEN GIVEN IN INDEX FILE SO REMOVE FROM HERE
// import mongoose from "mongoose"
// import {DB_NAME} from "./contants.js"

//import connection by making another file
import connectDB from "./db/index.js"
console.log("ENV MONGODB_URI:", process.env.MONGODB_URI);
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})





/*
//BETTER APPROACH THEN MAKING FUNCTION
;(async()=>{
    try{
        //DB CONNECT
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    }
    catch(error){
        console.log("Error:",error);
        throw err
        
    }
})()
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
*/