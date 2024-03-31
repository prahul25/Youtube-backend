import mongoose from "mongoose"
import { DB_NAME } from "../constant.js"

const connectDB = async ()=>{
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongo DB connected successfully ${connectionInstance.connection.host}`);
    }catch(error){
        console.log("Failed to Connect :",error)
        throw error
    }
}

export default connectDB