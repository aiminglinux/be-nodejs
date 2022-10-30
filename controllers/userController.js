const User = require('../models/User');
const cloudiary = require('../configs/cloudinary')
const { uploadToCloudinary } = require('../utils/cloudinary')

const getUsers = async (req, res) => {
    const users = await User.find({})
}

const getUser = async (req, res) => {}

const updateUser = async (req, res) => {
    const id = req.params.id
    const user = await User.findOne({_id: id}).exec()

    if (!user) return res.status(204).json({ message: `User with ID ${id} was not found`})

    if (req.body.picture.publicID !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
        const {url, public_id: publicID} = await uploadToCloudinary(req.body.picture.url, 'Profiles')
    }

    if (user.picture?.publicId !== process.env.CLOUDINARY_DEFAULT_PUBLIC_ID) {
        cloudiary.uploader.destroy(user.picture.publicId)
    }

    const updatedUser = await User.findOneAndUpdate({ _id: id }, { ...req.body }, { new: true });
    res.json(updatedUser.toObject({ getters: true }));
}