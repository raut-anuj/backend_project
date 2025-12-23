<<<<<<< HEAD
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }




// const asynchandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
=======
const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}

export { asyncHandler }




// const asynchandler=(fn)=>async(req,res,next)=>{
//     try{
//         await fn(req,res,next)
//     }
//     catch(error){
//         res.status(error.code||500).json({
//             success:false,
//             message:error.message
//         })
//     }
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
// }