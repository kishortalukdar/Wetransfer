import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { User } from '../models/user.model.js'
import Joi from '@hapi/joi'


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registrationSchema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    username: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});



const registerUser = asyncHandler(async (req, res) => {
    const { error, value } = registrationSchema.validate(req.body);

    if (error) {
        return res.status(422).json(new ApiResponse(422, error.details[0].message, "error"));
    }

    const existedUser = await User.findOne({
        $or: [{ username: value.username }, { email: value.email }]
    });

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    const user = await User.create({
        firstName: value.firstName,
        lastName: value.lastName,
        username: value.username.toLowerCase(),
        email: value.email,
        password: value.password
    });

    // Remove the password and refresh token from the user object
    const createUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createUser) {
        throw new ApiError(500, "Something went wrong while user register");
    }

    return res.status(201).json(new ApiResponse(200, createUser, "Register successfully"));
});


// ... (import statements)

const loginUser = asyncHandler(async (req, res) => {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
        return res.status(400).json(new ApiResponse(400, error.details[0].message, "Validation Error"));
    }


    const user = await User.findOne({
         email:value.email 
    });

    if (user && (await user.isPasswordCorrect(value.password))) {
       
        // Remove any existing refresh tokens
        await User.updateOne({ _id: user._id }, { $unset: { refreshToken: 1 } });

        // generate refresh token and access token 
        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

        // find the login user 
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        user: loggedInUser, accessToken, refreshToken
                    },
                    "User logged In Successfully"
                )
            )



    } else {
        throw new ApiError(401, "Invalid Credentials");
    }
});


// ... (other code)




export {
    registerUser,
    loginUser,

};