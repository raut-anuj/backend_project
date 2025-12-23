<<<<<<< HEAD
// import {v2 as cloudinary} from "cloudinary"
// import fs from "fs"


// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null
//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         // file has been uploaded successfull
//         //console.log("file is uploaded on cloudinary ", response.url);
//         fs.unlinkSync(localFilePath)
//         //console.log(response);
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
//         return null;
//     }
// }


// export {uploadOnCloudinary}


import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary  = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        // Sanitize Windows file path (replace backslashes)
        const sanitizedPath = localFilePath.replace(/\\/g, "/");

        // Upload the file
        const response = await cloudinary.uploader.upload(sanitizedPath, {
            resource_type: "auto"
        });

        // Delete the temp local file after upload
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        // Log the real error for debugging
        console.error("Cloudinary upload failed:", error);

        // Delete temp file if upload failed
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return null;
    }
};

export { uploadOnCloudinary  };
=======
// import {v2 as cloudinary} from "cloudinary"
// import fs from "fs"


// cloudinary.config({ 
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
//   api_key: process.env.CLOUDINARY_API_KEY, 
//   api_secret: process.env.CLOUDINARY_API_SECRET 
// });

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         if (!localFilePath) return null
//         //upload the file on cloudinary
//         const response = await cloudinary.uploader.upload(localFilePath, {
//             resource_type: "auto"
//         })
//         // file has been uploaded successfull
//         //console.log("file is uploaded on cloudinary ", response.url);
//         fs.unlinkSync(localFilePath)
//         //console.log(response);
//         return response;

//     } catch (error) {
//         fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
//         return null;
//     }
// }


// export {uploadOnCloudinary}


import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary  = async (localFilePath) => {
    if (!localFilePath) return null;

    try {
        // Sanitize Windows file path (replace backslashes)
        const sanitizedPath = localFilePath.replace(/\\/g, "/");

        // Upload the file
        const response = await cloudinary.uploader.upload(sanitizedPath, {
            resource_type: "auto"
        });

        // Delete the temp local file after upload
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return response;

    } catch (error) {
        // Log the real error for debugging
        console.error("Cloudinary upload failed:", error);

        // Delete temp file if upload failed
        if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

        return null;
    }
};

export { uploadOnCloudinary  };
>>>>>>> 5872634bf5660afc11efca61e743efb9246a67de
