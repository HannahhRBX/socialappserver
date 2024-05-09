import mongoose, {Schema} from "mongoose";

// Create schema for the Post object
const PostSchema = new mongoose.Schema(
    {
        UserId: {type: String, required: true, min: 2, max: 63},
        BodyText: {type: String, required: true, min: 2, max: 63},
        Image: {type: String, max: 60},
        Comments: {type: Array, default: []},
        Likes: {type: Map, of: Boolean}
    },
    {timestamps: true}
);

const Post = mongoose.model("Post", PostSchema);
export default Post;