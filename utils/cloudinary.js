const cloudinary = require('../configs/cloudinary');

const uploadToCloudinary = async (file, folder) => {
  try {
    const uploadedResponse = await cloudinary.uploader.upload(file, {
      folder: `${folder}`,
    });
    return uploadedResponse;
  } catch (err) {
    console.log(err);
  }
};

module.exports = { uploadToCloudinary };
