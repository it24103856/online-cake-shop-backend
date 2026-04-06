 import mongoose from "mongoose";

const CakeSchema=new mongoose.Schema({
 name:{
    type: String,
    required: true,

 },
 altName:{
    type: String,
    required: true,
 },
 description:{
     type: String,
     required: true,
 },
 price:{
     type: Number,
     required: true,
 },
 Image:{
     type: [String],
        required: false,
        default: []
    },
    category:{
        type: String,
        required: true,
    },
    flavor:{
        type: String,
        required: true,
    },
    weight:{
        type: String,
        required: true,
    },
    quantity:{
        type: Number,
        required: true,
    },
    rating:{
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 5
    },
    reviews:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Review",
        required: false,
        default: []

    },
    isAvailable:{
        type: Boolean,
        required: true,
        default: true,
    }
    
    

    


},{ timestamps: true })

export default mongoose.model("Cake",CakeSchema);
