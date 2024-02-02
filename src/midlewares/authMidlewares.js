import { User } from '../models/user.model.js'
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"


const isAutheticated = asyncHandler(async(req, _, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")        
        if (!token) {
            throw new ApiError(401, "Unothorised Uers")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
    
})

const authorizedRole = (...roles) => {
    return (req, _, next) => {
        if (!roles.includes(req.user?.role || '')) {
            throw new ApiError(401, "Role is not allowed");
        }
        next();
    };
};


export {isAutheticated,authorizedRole}


