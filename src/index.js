import dotenv from "dotenv"
import express from "express";
import connectDB from "./db/index.js";
import {app} from "./app.js";
dotenv.config({
    path:"./env"
});

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is Running on port  ${process.env.PORT}`);
    })
    app.on("error" , (error)=>{
        console.log("ERROR:" ,error)
        throw error
    })
}).catch((err)=>{
    console.log("Failed Mongo db connection" , err)
})

/*
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error" , (error)=>{
            console.log("ERROR" , error)
            throw error
        })

        app.listen(process.env.PORT , () =>{
            console.log(`App is running on port${process.env.PORT}`)
        })
    } catch (error) {
        console.log("ERROR" , error)
        throw error
    }
})()
*/

