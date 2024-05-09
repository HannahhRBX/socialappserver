import express from 'express';
import {GetPosts,GetPost,LikeUnlikePost,DeletePost,DeleteComment,AddCommentToPost} from "../controllers/PostController.js";
import {authenticateToken} from "../middleware/Authenticate.js";

const router = express.Router();

// Post
router.post("/:id/comment",authenticateToken,AddCommentToPost);

// Delete
router.delete("/:id/delete/:userId/:createdAt",authenticateToken,DeleteComment);
router.delete("/:id/delete",authenticateToken,DeletePost);

// Update
router.patch("/:id/like",authenticateToken,LikeUnlikePost);

// Retrieve
router.get("/:id",GetPost);
router.get("/",GetPosts);





export default router;