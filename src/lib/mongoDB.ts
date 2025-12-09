import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI as string;

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = {conn : null , promise : null};
}

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if(!cached.promise){
        cached.promise = mongoose.connect(mongoUri , {
            bufferCommands : false,
        })
    }

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;