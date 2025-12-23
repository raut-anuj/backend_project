<<<<<<< HEAD
import mongoose, {Schema} from "mongoose"

const playlistSchema=new Schema({
   
    video:{
        type:Schema.Types.ObjectId,
            ref:"Video"
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    
},
{
    timestamps:true
})
=======
import mongoose, {Schema} from "mongoose"

const playlistSchema=new Schema({
   
    video:{
        type:Schema.Types.ObjectId,
            ref:"Video"
    },
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    videos:[
            {
                type:Schema.Types.ObjectId,
                ref:"Video"
        }
    ],
    owner:{
        type:Schema.Types.ObjectId,
        ref:"Video"
    },
    
},
{
    timestamps:true
})
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
export const Playlist=mongoose.model("Playlist",playlistSchema)