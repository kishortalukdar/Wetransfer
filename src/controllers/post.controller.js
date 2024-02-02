import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import { Post } from '../models/posts.model.js'
import Joi from '@hapi/joi'
import mongoose from 'mongoose';


const postValidationSchema = Joi.object({
    title: Joi.string().required(),
    body: Joi.string().required(),
    status: Joi.string().valid("Active", "InActive").required(),
    latitude: Joi.number().required(),
    longitude: Joi.number().required(),
});

const createPost = asyncHandler(async (req, res) => {

    const { error, value } = postValidationSchema.validate(req.body);


    if (error) {
        return res.status(201).json(new ApiResponse(400, { error: error.details[0].message }));
    }

    const {_id} = req.user
 
    const post = await Post.create({
        title: value.title,
        body: value.body,
        status : value.status,
        latitude : value.latitude,
        longitude: value.longitude,
        createdBy: _id,
    });

    if (!post) {
        throw new ApiError(500, "some went wrong")
    }
    return res.status(201).json(new ApiResponse(200, post, "post create sucessfully "))


})


const getallPost = asyncHandler(async (req, res) => {
    const post = await Post.find({})

    if (post.length > 0) {
        return res.status(201).json(new ApiResponse(200, post))
    }
    throw new ApiError(500, "data is not avaliable")

})

const updatePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const { error, value } = postValidationSchema.validate(req.body);

    if (error) {
        throw new ApiError(400, error.details[0].message);
    }

    const updatedPost = await Post.findByIdAndUpdate(
        postId,
        {
            $set: {
                title: value.title,
                body: value.body,
                geoLocations: value.geoLocations,
            },
        },
        { new: true }
    );

    if (!updatedPost) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(new ApiResponse(200, updatedPost, "Post updated successfully"));
});




const deletePost = asyncHandler(async (req, res) => {
    const postId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, "Invalid Post ID");
    }

    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
        throw new ApiError(404, "Post not found");
    }

    res.status(200).json(new ApiResponse(200, "Post deleted successfully"));
});



const postCount = asyncHandler(async (req, res) => {
    try {
        const activeCount = await Post.countDocuments({ status: 'Active' });
        const inactiveCount = await Post.countDocuments({ status: 'InActive' });

        return res.status(200).json(new ApiResponse(200, {activeCount,inactiveCount},"this is all post"));

    } catch (error) {
        throw new ApiError(500, "Internal Server Error");
    }
});

const retrievePostsByLocation = asyncHandler(async (req, res) => {
    try {
        const { latitude, longitude } = req.query;

        if (!latitude || !longitude) {
            throw new ApiError(400, "Latitude and longitude are required");
        }

        const posts = await Post.find({
            latitude: { $eq: parseFloat(latitude) },
            longitude: { $eq: parseFloat(longitude) },
        });

        if (posts.length === 0) {
            throw new ApiError(404, "No posts found for the specified location");
        }

        return res.status(200).json(new ApiResponse(200, posts));
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});


export {
    createPost,
    getallPost,
    updatePost,
    deletePost,
    postCount,
    retrievePostsByLocation
}
