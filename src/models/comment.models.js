<<<<<<< HEAD
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import mongoose, {Schema} from "mongoose"

const commentSchema =new Schema(
    {
        content:{
            type:String,
            required:true
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Comment= mongoose.model("Comment",
=======
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import mongoose, {Schema} from "mongoose"

const commentSchema =new Schema(
    {
        content:{
            type:String,
            required:true
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video"
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    },
    {
        timestamps:true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

export const Comment= mongoose.model("Comment",
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
    commentSchema)