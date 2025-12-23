<<<<<<< HEAD
//The things we have to do for register user
    //get user details
    //validation- non empty [fullname ,email ,password]
    //check wheter if user already exists-->> checking can be done by the help of username or by email also.
    //check for image and the cover photo avatar
    //if available then upload at to cloudinary ,avatr
    //create user object--> create  entry in db
    //remove password and refresh the token feild from Response
    //check for user creation
    //retuen Response

// res.status(200).json({
//     message:"ok"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { log } from "console";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Fetch user as a full Mongoose document (no .lean())
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Ensure methods exist on the document
    if (typeof user.generateAccessToken !== "function" || typeof user.generateRefreshToken !== "function") {
      console.warn("User methods missing, regenerating User document from schema");
      // Re-fetch as a proper document (this is defensive, rarely needed)
      const freshUser = await User.findById(userId);
      if (!freshUser) throw new ApiError(404, "User not found on retry");
      user = freshUser;
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error);
    throw new ApiError(500, "Something went wrong");
  }
};



const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;

    if ([fullName, email, userName, password].some(f => f?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log(avatarLocalPath);
    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(coverImageLocalPath);
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) throw new ApiError(500, "Avatar upload failed");

    // Upload cover image if exists
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage?.url) throw new ApiError(500, "Cover image upload failed");
    }

    // Create user in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed. Please try again.");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser=asyncHandler (async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send via cookies
    //send res. that successfully registered

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
}
   
    //yh hamko [username] find kr doh yh phr hmko [email] find kr doh dono mh sh koi ek
    //yh koi ek bhi find kr doh alag alag tarika sh find kro
    // User.findOne({userName})
    // User.findOne({email})
    const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }
      //user yh [user (mera wala created user) mera wala user ha]
      //User yh [User mongoose wala user ha]

      const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

      //yaha pr accesstoken and refreshtoken destructure kr kh hm leh rhe ha.
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

      //“Go to the database, find the user with this ID, and return their information but remove the password and refreshToken fields.”
      const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

      const options = {
        httpOnly: true,
        secure: true,
    };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unsetset:{
        refreshToken:1
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Fetch the user as a full Mongoose document
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invalid refresh token");

        // Check if the stored refresh token matches
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        // Generate new tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Cookie options
        const options = {
            httpOnly: true,
            secure: true,
        };

        // Send response with new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  // const {oldPassword,newPassword,checkpassword}=req.body
  // if(!(changepassword===newpassword))
    // throw new ApiError(400,"Invalid match of password")

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))

})

//getCurrentuser= Tell me which user is logged in right now.
const getCurrentuser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json( new ApiResponse(
      200,req.user,
      "current user fetched"
    ))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const{fullName,email}=req.body
    if(!fullName || !email){ 
    throw new ApiError(400,"All fields are required")
   }
   const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName:fullName,
        email:email
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
      throw new ApiError(404,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
      throw new ApiError(404,"Error while uploading an Avatar ")
    }
    const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
      throw new ApiError(404,"Cover image file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
      throw new ApiError(404,"Error while uploading an coverImage ")
    }
    const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
  //const { username } = req.params is used to extract values from the URL.eg. we send information(data) from postman in URl, from there it extract,
    const {username}=req.params
    if(!username?.trim()){
      throw new ApiError(400,"Username is not found")
    }
   const channel=await User.aggregate([
    {
      //yha pr user kh name match kiya gya ha...
      //“Find all documents where the username field in the database is exactly equal to the lowercase version of the input username.”
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      //yha pr channel kh through subscribers count hua ha..
       $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
      }
    },
    {
      $addFields:{
        //This adds a new field called subscribersCount which counts how many 
        // people are in the subscribers array.
        subscribersCount: {
               $size: "$subscribers"
        },
        //This adds another field called channelsSubscribedToCount which counts how many channels this user has subscribed to.
        channelsSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed:{
          //- If the current logged-in user’s ID (req.user?._id) is inside the list of subscriber IDs 
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
//     - subscribersCount → How many people follow this channel
// - channelsSubscribedToCount → How many channels this user follows
// - isSubscribed → Is you (the logged-in user) one of the followers?

    {
     $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

    }
        
    }
   ])
   if(!channel?.length){
    throw new ApiError(404,"Channel not found")
   }
   return  res
   .status(200)
   .json(
    new ApiResponse(200,channel[0],"User channelFetched successfully")
   )
})

//yha ph pipelining hua ha video 21 mh sh...agar koi problem hua toh waha sh dekh lena.
const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
         from :"videos",
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline:[
          {
            $lookup:{
              from :"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          // yh wala pipeline array datastructure koh thk krna kh liya ha.
          {
              $addFields:{
                owner:{
                  $first:"$owner"
                }
              }
          }
         ]
      }
    }
  ])
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched successfully"
    )
  )
})
//ek ek kr kh check krne kh liya yh if kh use kr th ha... lakin yha jayda optimise nhi ha...ku ki bahut sara fields check krna ha toh time lagah gh likhne mh...so for that we use(for that see above the code)
// if(fullName=="")
//     {
//         throw new ApiError(400,"fullname is requuired")
//     }


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}

// - ApiError → "Error" (yes, it's used to throw Errors)
// - ApiResponse → "Response" (used to send structured success Responses)


// Postman request
// {
//     "statusCode": 200,
//     "data": {
//         "_id": "69214ba05d5bfa717f8a2990",
//         "userName": "knmnd",
//         "email": "d@example.com",
//         "fullName": "aqwedd",
//         "avatar": "http://res.cloudinary.com/dgrkbhfe0/image/upload/v1763789727/cpdwhsvcflqpmss6k0mx.png",
//         "coverImage": "http://res.cloudinary.com/dgrkbhfe0/image/upload/v1763789728/xe908jk6kabde8xr2b6u.png",
//         "createdAt": "2025-11-22T05:35:28.937Z",
//         "updatedAt": "2025-11-22T05:35:28.937Z",
//         "__v": 0
//     },
//     "message": "User registered Successfully"
// } 
=======
//The things we have to do for register user
    //get user details
    //validation- non empty [fullname ,email ,password]
    //check wheter if user already exists-->> checking can be done by the help of username or by email also.
    //check for image and the cover photo avatar
    //if available then upload at to cloudinary ,avatr
    //create user object--> create  entry in db
    //remove password and refresh the token feild from Response
    //check for user creation
    //retuen Response

// res.status(200).json({
//     message:"ok"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { log } from "console";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // Fetch user as a full Mongoose document (no .lean())
    const user = await User.findById(userId);
    
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Ensure methods exist on the document
    if (typeof user.generateAccessToken !== "function" || typeof user.generateRefreshToken !== "function") {
      console.warn("User methods missing, regenerating User document from schema");
      // Re-fetch as a proper document (this is defensive, rarely needed)
      const freshUser = await User.findById(userId);
      if (!freshUser) throw new ApiError(404, "User not found on retry");
      user = freshUser;
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Save refresh token in DB
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error);
    throw new ApiError(500, "Something went wrong");
  }
};



const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, userName, password } = req.body;

    if ([fullName, email, userName, password].some(f => f?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ $or: [{ userName }, { email }] });
    if (existedUser) {
        throw new ApiError(409, "Username or email already exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    console.log(avatarLocalPath);
    
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    console.log(coverImageLocalPath);
    

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    if (!avatar?.url) throw new ApiError(500, "Avatar upload failed");

    // Upload cover image if exists
    let coverImage = null;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        if (!coverImage?.url) throw new ApiError(500, "Cover image upload failed");
    }

    // Create user in DB
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        userName: userName.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "User creation failed. Please try again.");
    }

    return res.status(201).json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser=asyncHandler (async(req,res)=>{
    //req body->data
    //username or email
    //find the user
    //password check
    //access and refresh token
    //send via cookies
    //send res. that successfully registered

    const { email, username, password } = req.body;
    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
}
   
    //yh hamko [username] find kr doh yh phr hmko [email] find kr doh dono mh sh koi ek
    //yh koi ek bhi find kr doh alag alag tarika sh find kro
    // User.findOne({userName})
    // User.findOne({email})
    const user = await User.findOne({
        $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }
      //user yh [user (mera wala created user) mera wala user ha]
      //User yh [User mongoose wala user ha]

      const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Password is incorrect");
    }

      //yaha pr accesstoken and refreshtoken destructure kr kh hm leh rhe ha.
      const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

      //“Go to the database, find the user with this ID, and return their information but remove the password and refreshToken fields.”
      const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

      const options = {
        httpOnly: true,
        secure: true,
    };

      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "User logged in successfully"
            )
        );
});

const logoutUser=asyncHandler(async(req,res)=>{
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unsetset:{
        refreshToken:1
      }
    },
    {
      new:true
    }
  )

  const options={
    httpOnly:true,
    secure:true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"User logged out"))
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    // Get refresh token from cookies or body
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        // Fetch the user as a full Mongoose document
        const user = await User.findById(decodedToken?._id);
        if (!user) throw new ApiError(401, "Invalid refresh token");

        // Check if the stored refresh token matches
        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or invalid");
        }

        // Generate new tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

        // Cookie options
        const options = {
            httpOnly: true,
            secure: true,
        };

        // Send response with new tokens
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed successfully"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
});

const changeCurrentPassword=asyncHandler(async(req,res)=>{
  const {oldPassword,newPassword}=req.body

  // const {oldPassword,newPassword,checkpassword}=req.body
  // if(!(changepassword===newpassword))
    // throw new ApiError(400,"Invalid match of password")

  const user=await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCorrect){
    throw new ApiError(400,"invalid old password")
  }
  user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))

})

//getCurrentuser= Tell me which user is logged in right now.
const getCurrentuser=asyncHandler(async(req,res)=>{
  return res
  .status(200)
  .json( new ApiResponse(
      200,req.user,
      "current user fetched"
    ))
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const{fullName,email}=req.body
    if(!fullName || !email){ 
    throw new ApiError(400,"All fields are required")
   }
   const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        fullName:fullName,
        email:email
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path

    if(!avatarLocalPath){
      throw new ApiError(404,"Avatar file is missing")
    }
    const avatar=await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
      throw new ApiError(404,"Error while uploading an Avatar ")
    }
    const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        avatar:avatar.url
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const coverImageLocalPath=req.file?.path

    if(!coverImageLocalPath){
      throw new ApiError(404,"Cover image file is missing")
    }
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
      throw new ApiError(404,"Error while uploading an coverImage ")
    }
    const user=await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set:{
        coverImage:coverImage.url
      }
    },
    {new:true}

  ).select("-password")
  return res
  .status(200)
  .json(new ApiResponse(200,user,"account deails updated successfully"))
})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
  //const { username } = req.params is used to extract values from the URL.eg. we send information(data) from postman in URl, from there it extract,
    const {username}=req.params
    if(!username?.trim()){
      throw new ApiError(400,"Username is not found")
    }
   const channel=await User.aggregate([
    {
      //yha pr user kh name match kiya gya ha...
      //“Find all documents where the username field in the database is exactly equal to the lowercase version of the input username.”
      $match:{
        username:username?.toLowerCase()
      }
    },
    {
      //yha pr channel kh through subscribers count hua ha..
       $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
      }
    },
    {
      $addFields:{
        //This adds a new field called subscribersCount which counts how many 
        // people are in the subscribers array.
        subscribersCount: {
               $size: "$subscribers"
        },
        //This adds another field called channelsSubscribedToCount which counts how many channels this user has subscribed to.
        channelsSubscribedToCount:{
          $size:"$subscribedTo"
        },
        isSubscribed:{
          //- If the current logged-in user’s ID (req.user?._id) is inside the list of subscriber IDs 
          $cond:{
            if:{$in:[req.user?._id,"$subscribers.subscriber"]},
            then:true,
            else:false
          }
        }
      }
    },
//     - subscribersCount → How many people follow this channel
// - channelsSubscribedToCount → How many channels this user follows
// - isSubscribed → Is you (the logged-in user) one of the followers?

    {
     $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

    }
        
    }
   ])
   if(!channel?.length){
    throw new ApiError(404,"Channel not found")
   }
   return  res
   .status(200)
   .json(
    new ApiResponse(200,channel[0],"User channelFetched successfully")
   )
})

//yha ph pipelining hua ha video 21 mh sh...agar koi problem hua toh waha sh dekh lena.
const getWatchHistory=asyncHandler(async(req,res)=>{
  const user=await User.aggregate([
    {
      $match:{
        _id:new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
         from :"videos",
         localField:"watchHistory",
         foreignField:"_id",
         as:"watchHistory",
         pipeline:[
          {
            $lookup:{
              from :"users",
              localField:"owner",
              foreignField:"_id",
              as:"owner",
              pipeline:[
                {
                  $project:{
                    fullName:1,
                    username:1,
                    avatar:1
                  }
                }
              ]
            }
          },
          // yh wala pipeline array datastructure koh thk krna kh liya ha.
          {
              $addFields:{
                owner:{
                  $first:"$owner"
                }
              }
          }
         ]
      }
    }
  ])
  return res
  .status(200)
  .json(
    new ApiResponse(
      200,
      user[0].watchHistory,
      "Watch history fetched successfully"
    )
  )
})
//ek ek kr kh check krne kh liya yh if kh use kr th ha... lakin yha jayda optimise nhi ha...ku ki bahut sara fields check krna ha toh time lagah gh likhne mh...so for that we use(for that see above the code)
// if(fullName=="")
//     {
//         throw new ApiError(400,"fullname is requuired")
//     }


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}

// - ApiError → "Error" (yes, it's used to throw Errors)
// - ApiResponse → "Response" (used to send structured success Responses)


// Postman request
// {
//     "statusCode": 200,
//     "data": {
//         "_id": "69214ba05d5bfa717f8a2990",
//         "userName": "knmnd",
//         "email": "d@example.com",
//         "fullName": "aqwedd",
//         "avatar": "http://res.cloudinary.com/dgrkbhfe0/image/upload/v1763789727/cpdwhsvcflqpmss6k0mx.png",
//         "coverImage": "http://res.cloudinary.com/dgrkbhfe0/image/upload/v1763789728/xe908jk6kabde8xr2b6u.png",
//         "createdAt": "2025-11-22T05:35:28.937Z",
//         "updatedAt": "2025-11-22T05:35:28.937Z",
//         "__v": 0
//     },
//     "message": "User registered Successfully"
// } 
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
