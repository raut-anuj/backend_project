<<<<<<< HEAD
import mongoose, {Schema} from "mongoose"

const tweetSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},  
{
    timestamps:true
})

export const Tweet=mongoose.model("Tweet",tweetSchema)
=======
import mongoose, {Schema} from "mongoose"

const tweetSchema=new Schema({
    content:{
        type:String,
        required:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},  
{
    timestamps:true
})

export const Tweet=mongoose.model("Tweet",tweetSchema)
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
