// users[icon: user]{
//     id ObjectId pk
//     username string
//     email string
//     password string
//     profile_photo string
//     posts ObjectId[] posts
//     comments ObjectId[] comments
//   }

import mongoose, { Schema } from "mongoose";
// import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    profile_photo: {
        type: String,
    },
    cover_photo: {
        type: String,
    },
    refresh_token: {
        type: String
    },
    posts: [
        {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }
    ]
}, { timestamps: true })

userSchema.pre('save',async function (next) {
    if (!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

userSchema.method.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.method.generateAccessToken = async function () {
    jwt.sign({
        _id: this._id,
        usename: this.usename,
        email: this.email
    }, process.env.ACCESSTOKEN_SECRET_KEY, {
        expiresIn: process.env.ACCESSTOKEN_EXP_TIME
    })
}

userSchema.method.generateRefreshToken = async function () {
    jwt.sign({
        _id: this._id
    }, process.env.REFRESHTOKEN_SECRET_KEY, {
        expiresIn: process.env.REFRESHTOKEN_EXP_TIME
    })
}

// userSchema.plugin(mongooseAggregatePaginate)

export const User = mongoose.model("User", userSchema);