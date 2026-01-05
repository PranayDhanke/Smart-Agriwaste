import { Mongoose } from "mongoose";


export {};


declare global {
    var mongoose: {
        conn : Mongoose | null;
        promise : Promise<Mongoose> | null;
    }
    

}