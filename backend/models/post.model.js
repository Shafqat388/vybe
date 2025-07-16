import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: {
    type: String,
    default: null  // ✅ Main text content for text-only posts
  },
  mediaType: {
    type: String,
    enum: ["image", "video"],
    default: null  // ✅ Optional for text-only posts
  },
  media: {
    type: String,
    default: null  // ✅ Optional for text-only posts
  },
  caption: {
    type: String,
    default: null  // ✅ Optional for media posts only
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  comments: [
    {
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },
      message: {
        type: String
      }
    }
  ]
}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;
