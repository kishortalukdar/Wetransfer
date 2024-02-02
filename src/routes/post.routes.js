import { Router } from "express";
import {
    createPost,
    getallPost,
    updatePost,
    deletePost,
    retrievePostsByLocation,
    postCount
 
} from "../controllers/post.controller.js";

import {isAutheticated} from '../midlewares/authMidlewares.js'



const router = Router()

router.route("/create").post(isAutheticated,createPost)
router.route("/get-all").get(isAutheticated,getallPost)
router.route("/update/:id").put(isAutheticated,updatePost)
router.route("/delete/:id").delete(isAutheticated,deletePost)
router.route("/location-post/").post(isAutheticated,retrievePostsByLocation)
router.route("/dashboard").get(isAutheticated,postCount)




export default router