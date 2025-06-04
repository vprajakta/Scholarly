import mongoose from "mongoose";

//connect to mongodb database

const connectDB = async ()=>{
    mongoose.connection.on('connected',()=>{
        console.log('database connected');
    })
    await mongoose.connect(`${process.env.MONGO_URI}/Scholarly`);
}
export default connectDB;