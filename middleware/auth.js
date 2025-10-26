import User from "../models/User.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cloudinary from "../config/cloudinary.js";

// Middleware to protect routes

export const protectRoute =async(req, res, next) => {
    try {
        const token = req.headers.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select(
            "-password"
        );
        if(!user)
            return res.json({
              success: false,
              message: 'User not found'
            }
        )
        req.user = user;
        next();
    }catch(error){
      console.log(error.message);
      res.json(
        {
            success : false,
            message: error.message
        }
      )
    }
}

// controller to check if user is authenticated

export const checkAuth = (req,res) => {
    res.json(
        {
            success: true,
            user: req.user
        }
    )
} 

// Controller to update user profile details

export const updateProfile = async(req, res) => {
    try {

        const { profilePic, bio, fullName} = req.body;
        const userId = req.user._id;
        let updatedUser;

        if(!profilePic){
            await User.findByIdAndUpdate(
                userId,
                {
                    bio,
                    fullName
                },
                {
                    new: true
                }
            );

        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    profilePic: upload.secure_url,
                    bio,
                    fullName
                }, 
                {
                    new: true
                }
            )
        }
        res.json({
            success: true,
            user: updatedUser
        })
    } catch(error){
       res.json({
        success: false,
        message: error.message
       })
    }
}