import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";

// Function to create a new post
export const CreatePost = async(req,res)=>{
    try {
        console.log(req.body,req.file)
        
        // Getting uploaded file from request
        const UploadFile = req.file;
        var FileName = null;
        if (UploadFile){
            FileName = UploadFile.filename;
        }
        // Destructuring request body to get user id, body text, and image
        const {
            UserId,
            BodyText,
        } = req.body;
        
        const user = await User.findById(UserId);
        
        // Creating new post with provided data
        const NewPost = new Post({
            UserId,
            BodyText,
            Image: FileName,
            Comments: [],
            Likes: {}
        });
        await NewPost.save();
        const GetPosts = await Post.find();
        res.status(200).json(GetPosts);
    }catch(err){
        // Send response with error message
        res.status(500).json({error: err.message});
    }
};

export const GetPosts = async(req,res) =>{
    try {
        const Posts = await Post.find();
        res.status(200).json(Posts);
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to get a specific post
export const GetPost = async(req,res) =>{
    try {
        const {id} = req.params;
        const GetPost = await Post.findById(id);
        res.status(200).json(GetPost);
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to get all posts by a specific user
export const GetAllPostsByUser = async(req,res) =>{
    try {
        const {id} = req.params;
        const Posts = await Post.find({UserId: id});
        res.status(200).json(Posts);
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to get all posts by a specific user
export const GetAllPostsByKeyword = async(req,res) =>{
    try {
        const {keyword} = req.params;
        
        // Find users whose first name or last name contains the keyword
        const users = await User.find({
            $or: [
                { FirstName: { $regex: keyword, $options: 'i' } },
                { LastName: { $regex: keyword, $options: 'i' } }
            ]
        });

        // Get the IDs of the users
        const userIds = users.map(user => user._id);

        // Find posts that were made by the users or contain the keyword in the BodyText
        const Posts = await Post.find({
            $or: [
                { UserId: { $in: userIds } },
                // Case insensitive search for all posts containing specific keyword
                { BodyText: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.status(200).json(Posts);
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to like or unlike a post
export const LikeUnlikePost = async(req,res) =>{
    try {
        const {id} = req.params;
        const {UserId} = req.body;

        if (req.user.id == UserId){
        
            const GetPost = await Post.findById(id);
            const FindLike = GetPost.Likes.get(UserId);
            if (FindLike){
                GetPost.Likes.delete(UserId);
            }else{
                GetPost.Likes.set(UserId,true)
            }
            const UpdatePost = await Post.findByIdAndUpdate(
                id,{Likes: GetPost.Likes},{new:true}
            );
            res.status(200).json(UpdatePost);

        }else{
            res.status(400).json({message: "Unauthorized"})
        }
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to add a comment to a post
export const AddCommentToPost = async (req, res) => {
    try {
        const { id } = req.params;
        const { UserId, BodyText } = req.body;
        console.log(UserId,BodyText)
        const GetPost = await Post.findById(id);

        // Create a new comment
        const newComment = [UserId, BodyText, new Date().toISOString()];

        // Add the new comment to the Comments array
        GetPost.Comments.push(newComment);

        // Update the post with the new Comments array
        const UpdatePost = await Post.findByIdAndUpdate(
            id, { Comments: GetPost.Comments }, { new: true }
        );

        // Send response with the updated post
        res.status(200).json(UpdatePost);
    } catch (error) {
        // Send response with error message
        res.status(400).json({ message: error.message });
    }
};

// Function to delete a post
export const DeletePost = async(req,res) =>{
    try {

        const {id} = req.params;
        const GetPost = await Post.findById(id);
        if (req.user.id == GetPost.UserId){
            const deletedPost = await Post.findByIdAndDelete(id);
            const Posts = await Post.find();
            res.status(200).json(Posts);
        }else{
            res.status(400).json({message: "Unauthorized"})
        }
        
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};

// Function to delete comment from post
export const DeleteComment = async(req,res) =>{
    try {

        const {id,userId,createdAt} = req.params;
        const GetPost = await Post.findById(id);
        // Find the comment with the UserId and createdAt
        
        const Comment = GetPost.Comments.find(comment => comment[0] === userId && comment[2] === createdAt);
        console.log(Comment)
        if (req.user.id == Comment[0]){
            GetPost.Comments = GetPost.Comments.filter(comment => comment !== Comment);
            const UpdatePost = await Post.findByIdAndUpdate(
                id, { Comments: GetPost.Comments }, { new: true }
            );
            // Send response with the updated post
            res.status(200).json(UpdatePost);
        }else{
            res.status(400).json({message: "Unauthorized"})
        }
        
    } catch(error) {
        // Send response with error message
        res.status(404).json({message: error.message})
    }
};