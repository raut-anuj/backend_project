<<<<<<< HEAD
import mongoose, {Schema} from "mongoose"
const likeSchema =new Schema({
    video:{
        type:Schema.Types.ObjectId,
            ref:"Video"
    },

 comment:{
        type:Schema.Types.ObjectId,
            ref:"Comment"
    },
     tweet:{
        type:Schema.Types.ObjectId,
            ref:"Tweet"
    },
     likedBy:{
        type:Schema.Types.ObjectId,
            ref:"User"
    },
},
{
    timestamps:true
}
)
=======
import mongoose, {Schema} from "mongoose"
const likeSchema =new Schema({
    video:{
        type:Schema.Types.ObjectId,
            ref:"Video"
    },

 comment:{
        type:Schema.Types.ObjectId,
            ref:"Comment"
    },
     tweet:{
        type:Schema.Types.ObjectId,
            ref:"Tweet"
    },
     likedBy:{
        type:Schema.Types.ObjectId,
            ref:"User"
    },
},
{
    timestamps:true
}
)
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
export const Like=mongoose.model("like",likeSchema)