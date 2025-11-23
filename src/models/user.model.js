import mongoose,{Schema} from "mongoose";
import  jwt from "jsonwebtoken"  /// what this line tells-->>"Hey, I want to use a tool called jsonwebtoken to help me work with tokens."

// what is token---->>>.A token is like a secret pass or ID card. It proves who you are when you visit a website or use an app.

import bcrypt from "bcrypt"   ///password koh encrypt krne kh liya which is necessary for data 

const userSchema=new Schema({
    username:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
        trim:true,
        index:true
    },
    email:{
        type:String,
        unique:true,
        lowercase:true,
        required:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    //profile images
    avatar:{
        type:String,  ///cloidinary URL
        required:true,
    },
    coverImage:{
        type:String,  ///cloidinary URL
    },
    watchHistory:{
        type:Schema.Types.ObjectId,
        ref:"Videos"
    },
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String,
    }
},
    {
        timestamps:true
    }
);

//yha pr password encrypt ho rha ha..........aur if mh yh check ho rha ha ki user-> passwrod change krna aya ha kya??  agar YES toh change hoga warna return ho jaye gh...

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


// Method is created to check the user password with its owns password
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

//generateAccessToken yh short life time kh liye generate kiya jh th ha... eg 1hours
userSchema.methods.generateAccessToken=function(){
    return jwt.sign(
        {
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
        
   )
}

//generateRefreshToken yh long life kh liye generate kiya jh th ha... eg.30days 
userSchema.methods.generateRefreshToken=function(){
    return jwt.sign(
        {
        _id:this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
        
   )}
   //yha pr {User} ,he ha joh mongoDb sh baat kr rha ha.
export const User=mongoose.model("User",userSchema)