import fs from 'fs';
import { User } from '../models/user.js';
import { uploadFileToCloudinary } from "../utils/cloudinary.js";
import jwt from 'jsonwebtoken'

const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
}

export const registerController = async (req, res) => {
    const { username, email, password } = req.body;

    const profile_photo_path = req.files.profile_photo[0].path;
    const cover_photo_path = req.files.cover_photo[0].path;
    if ([username, email, password].some(field => field?.trim() === "")) {
        return res.status(400).json({ message: "All fields are required." })
    }
    try {
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        })

        if (existingUser) {
            res.status(409).json({ message: "Email or Username is already exist." })
            throw new Error("Email or Username is already exist.")
        }

        let profile_photo = '';
        let cover_photo = '';

        if (profile_photo_path && cover_photo_path) {
            profile_photo = await uploadFileToCloudinary(profile_photo_path)
            cover_photo = await uploadFileToCloudinary(cover_photo_path)
        }

        const user = await User.create({
            email,
            username: username?.toLowerCase(),
            password,
            profile_photo,
            cover_photo
        })
        const createdUser = await User.findById(user._id).select("-password -refresh_token");

        if (!createdUser) {
            return res.status(500).json({ message: 'Something went wrong.' })
        }

        return res.status(200).json({ userInfo: createdUser, message: 'Registration successfully created!' })

    } catch (error) {
        console.log(error);
        fs.unlinkSync(profile_photo_path)
        fs.unlinkSync(cover_photo_path)
    }
}

const generateAccessTokenAndRefreshToken = async (userId) => {
    const existingUser = await User.findById(userId);

    if (!existingUser) {
        return res.status(404).json({ message: 'No User Found.' })
    }

    const accessToken = await existingUser.generateAccessToken();
    const refreshToken = await existingUser.generateRefreshToken();

    existingUser.refresh_token = refreshToken;
    await existingUser.save({ validateBeforeSave: false });

    return { accessToken, refreshToken }
}

export const loginController = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required." })
    }
    const existingUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!existingUser) {
        return res.status(400).json({ message: "No user found!" });
    }

    const isPasswordMatch = await existingUser.isPasswordMatch(password);

    if (!isPasswordMatch) {
        return res.status(401).json({ message: "Invaild Credentials." });
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(existingUser._id);

    const loggedInUser = await User.findById(existingUser._id).select("-password -refresh_token");
    return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options).
        json({ userInfo: loggedInUser, message: 'Login success.' })
}

// run if token expire 
export const generateNewRefreshToken = async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        return res.status(404).json({ message: 'No Token Found' })
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESHTOKEN_SECRET_KEY);
        const existingUser = await User.findById(decodedToken?._id);

        if (!existingUser) {
            return res.status(404).json({ message: 'No User Found' })
        }

        if (incomingRefreshToken !== existingUser.refresh_token) {
            return res.status(401).json({ message: 'Invalid Refresh Token' })
        }

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(existingUser._id);        

        return res.status(200).cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options).
            json({ message: 'Token Updated.' })
    } catch (error) {
        console.log('new refreshtoken error',error);
        return res.status(500).json({ message: 'Something went wrong' })
    }
}

export const logoutController = async (req, res) => {
    console.log(req.user);

    if (!req.user || !req.user._id) {
        return res.status(404).json({ message: 'No User Found' })
    }

    try {
        await User.findByIdAndUpdate(req.user._id, {
            $unset: {
                refresh_token: 1
            }
        },
            { new: true }
        );
        return res.status(200).clearCookie('accessToken', options).clearCookie('refreshToken', options).
            json({ message: `${req.user.username} logout successfully.` })

    } catch (error) {
        console.log('logout error',error);
        return res.status(500).json({ message: 'Something went wrong' })
    }
}