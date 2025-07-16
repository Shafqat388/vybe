import uploadOnCloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { getSocketId, io } from "../socket.js";
import fs from 'fs';
import mongoose from "mongoose";

// ✅ Upload Post (text-only, media-only, or both)
export const uploadPost = async (req, res) => {
    try {
        const { caption, mediaType } = req.body;
        let media = null;

        // Upload media if exists
        if (req.file) {
            media = await uploadOnCloudinary(req.file.path);
        }

        // Require at least caption or media
        if (!caption && !media) {
            return res.status(400).json({ message: "Post must contain either text or media." });
        }

        const post = await Post.create({
            caption,
            mediaType: media ? mediaType : null,
            media: media || null,
            author: req.userId,
        });

        // Add post to user's profile
        await User.findByIdAndUpdate(req.userId, {
            $push: { posts: post._id }
        });

        const populatedPost = await Post.findById(post._id)
            .populate("author", "name userName profileImage");

        return res.status(201).json(populatedPost);
    } catch (error) {
        return res.status(500).json({ message: `uploadPost error: ${error}` });
    }
};

// ✅ Get All Posts
export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find({})
            .populate("author", "name userName profileImage")
            .populate("comments.author", "name userName profileImage")
            .sort({ createdAt: -1 });

        return res.status(200).json(posts);
    } catch (error) {
        return res.status(500).json({ message: `getAllPosts error: ${error}` });
    }
};

// ✅ Like / Unlike Post
export const like = async (req, res) => {
    try {
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) return res.status(400).json({ message: "Post not found" });

        const alreadyLiked = post.likes.some(id => id.toString() === req.userId.toString());

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== req.userId.toString());
        } else {
            post.likes.push(req.userId);

            // Notify author
            if (post.author.toString() !== req.userId) {
                const notification = await Notification.create({
                    sender: req.userId,
                    receiver: post.author,
                    type: "like",
                    post: post._id,
                    message: "liked your post"
                });

                const populatedNotification = await Notification.findById(notification._id)
                    .populate("sender receiver post");

                const receiverSocketId = getSocketId(post.author);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newNotification", populatedNotification);
                }
            }
        }

        await post.save();
        await post.populate("author", "name userName profileImage");

        io.emit("likedPost", {
            postId: post._id,
            likes: post.likes
        });

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: `likePost error: ${error}` });
    }
};

// ✅ Comment on Post
export const comment = async (req, res) => {
    try {
        const { message } = req.body;
        const postId = req.params.postId;
        const post = await Post.findById(postId);
        if (!post) return res.status(400).json({ message: "Post not found" });

        post.comments.push({
            author: req.userId,
            message
        });

        // Notify author
        if (post.author.toString() !== req.userId) {
            const notification = await Notification.create({
                sender: req.userId,
                receiver: post.author,
                type: "comment",
                post: post._id,
                message: "commented on your post"
            });

            const populatedNotification = await Notification.findById(notification._id)
                .populate("sender receiver post");

            const receiverSocketId = getSocketId(post.author);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", populatedNotification);
            }
        }

        await post.save();
        await post.populate("author", "name userName profileImage");
        await post.populate("comments.author");

        io.emit("commentedPost", {
            postId: post._id,
            comments: post.comments
        });

        return res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({ message: `commentPost error: ${error}` });
    }
};

// ✅ Save / Unsave Post
export const saved = async (req, res) => {
    try {
        const postId = req.params.postId;
        const user = await User.findById(req.userId);

        const alreadySaved = user.saved.some(id => id.toString() === postId.toString());

        if (alreadySaved) {
            user.saved = user.saved.filter(id => id.toString() !== postId.toString());
        } else {
            user.saved.push(postId);
        }

        await user.save();
        await user.populate("saved");

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: `savedPost error: ${error}` });
    }
};

// ✅ Delete Post
export const deletePost = async (req, res) => {
    try {
        const postId = req.params.postId;

        if (!mongoose.Types.ObjectId.isValid(postId)) {
            return res.status(400).json({ message: "Invalid post ID" });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "You are not allowed to delete this post" });
        }

        // Remove from user's post array
        await User.findByIdAndUpdate(post.author, {
            $pull: { posts: post._id }
        });

        // Delete related notifications
        await Notification.deleteMany({ post: post._id });

        // Delete post
        await Post.findByIdAndDelete(post._id);

        io.emit("postDeleted", { postId: post._id });

        return res.status(200).json({ message: "Post deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: `deletePost error: ${error}` });
    }
};
