import mongoose, { Schema } from "mongoose";

const postSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        status: {
            type: String,
            enum: ["Active", "InActive"], // Array of valid values
            required: true,
        },
        latitude: {
            type: Number,
            required: true,
        },
        longitude: {  // Changed to `longitude` to avoid the field name conflict
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true
    }
);

export const Post = mongoose.model("Post", postSchema);
