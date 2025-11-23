// import multer from "multer";
// //USING DISK STORAGE
// const storage = multer.diskStorage({
//     //cb is a callback
//   destination: function (req, file, cb) {
//     cb(null, "./public/temp")
//   },
//   filename: function (req, file, cb) {
//     //there are more options with file .(...)  lokk this in deep
//     cb(null, file.originalname)
//   }
 
  
// })
//  console.log(storage);
// export const upload = multer({
//      storage,
//     })


// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp")
//     },
//     filename: function (req, file, cb) {
      
//       cb(null, file.originalname)
//     }
//   })
  
// export const upload = multer({ 
//     storage, 
// })


import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/temp"); // make sure this folder exists
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // replace spaces and special characters
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + safeName);
  }
});

export const upload = multer({ storage });
