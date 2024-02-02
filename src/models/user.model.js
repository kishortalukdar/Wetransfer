import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import crypto from "crypto";


const userSchema = new Schema(
    {
        firstName: {
            type: String,
            require: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        lastName: {
            type: String,
            require: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        username: {
            type: String,
            require: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password)
}


userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.createPasswordResetToken = function () {
    // generate a reset token
    const resettoken = crypto.randomBytes(32).toString("hex");
    // generate token create hash or encrecapted
    this.passwordResetToken = crypto.createHash("sha256").update(resettoken).digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    return resettoken;


}



export const User = mongoose.model("User", userSchema);