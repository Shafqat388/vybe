import uploadOnCloudinary from "../config/cloudinary.js";
import Loop from "../models/loop.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";
import { getSocketId, io } from "../socket.js";

// Upload a loop
export const uploadLoop = async (req, res) => {
  try {
    const { caption } = req.body;
    let media;

    if (!req.file) {
      return res.status(400).json({ message: "Media is required" });
    }

    media = await uploadOnCloudinary(req.file.path);

    const loop = await Loop.create({
      caption,
      media,
      author: req.userId,
    });

    const user = await User.findById(req.userId);
    user.loops.push(loop._id);
    await user.save();

    const populatedLoop = await Loop.findById(loop._id).populate(
      "author",
      "name userName profileImage"
    );

    return res.status(201).json(populatedLoop);
  } catch (error) {
    return res.status(500).json({ message: `uploadLoop error: ${error.message}` });
  }
};

// Like a loop
export const like = async (req, res) => {
  try {
    const loopId = req.params.loopId;
    const loop = await Loop.findById(loopId);

    if (!loop) {
      return res.status(404).json({ message: "Loop not found" });
    }

    const alreadyLiked = loop.likes.includes(req.userId);

    if (alreadyLiked) {
      loop.likes = loop.likes.filter(
        (id) => id.toString() !== req.userId.toString()
      );
    } else {
      loop.likes.push(req.userId);

      if (loop.author.toString() !== req.userId.toString()) {
        const notification = await Notification.create({
          sender: req.userId,
          receiver: loop.author,
          type: "like",
          loop: loop._id,
          message: "liked your loop",
        });

        const populatedNotification = await Notification.findById(notification._id)
          .populate("sender", "name userName profileImage")
          .populate("receiver", "name userName profileImage")
          .populate("loop");

        const receiverSocketId = getSocketId(loop.author);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newNotification", populatedNotification);
        }
      }
    }

    await loop.save();
    await loop.populate("author", "name userName profileImage");

    io.emit("likedLoop", {
      loopId: loop._id,
      likes: loop.likes,
    });

    return res.status(200).json(loop);
  } catch (error) {
    return res.status(500).json({ message: `like loop error: ${error.message}` });
  }
};

// Comment on a loop
export const comment = async (req, res) => {
  try {
    const { message } = req.body;
    const loopId = req.params.loopId;

    const loop = await Loop.findById(loopId);

    if (!loop) {
      return res.status(404).json({ message: "Loop not found" });
    }

    loop.comments.push({
      author: req.userId,
      message,
    });

    if (loop.author.toString() !== req.userId.toString()) {
      const notification = await Notification.create({
        sender: req.userId,
        receiver: loop.author,
        type: "comment",
        loop: loop._id,
        message: "commented on your loop",
      });

      const populatedNotification = await Notification.findById(notification._id)
        .populate("sender", "name userName profileImage")
        .populate("receiver", "name userName profileImage")
        .populate("loop");

      const receiverSocketId = getSocketId(loop.author);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", populatedNotification);
      }
    }

    await loop.save();
    await loop.populate("author", "name userName profileImage");
    await loop.populate("comments.author", "userName profileImage");

    io.emit("commentedLoop", {
      loopId: loop._id,
      comments: loop.comments,
    });

    return res.status(200).json(loop);
  } catch (error) {
    return res.status(500).json({ message: `comment loop error: ${error.message}` });
  }
};

// Get all loops
export const getAllLoops = async (req, res) => {
  try {
    const loops = await Loop.find({})
      .populate("author", "name userName profileImage")
      .populate("comments.author", "userName profileImage");

    return res.status(200).json(loops);
  } catch (error) {
    return res.status(500).json({ message: `getAllLoops error: ${error.message}` });
  }
};

// Delete a loop
export const deleteLoop = async (req, res) => {
  try {
    const loop = await Loop.findById(req.params.loopId);

    if (!loop) {
      return res.status(404).json({ message: "Loop not found" });
    }

    if (loop.author.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this loop" });
    }

    await loop.deleteOne();
    io.emit("loopDeleted", { loopId: loop._id });

    return res.status(200).json({ message: "Loop deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `deleteLoop error: ${error.message}` });
  }
};

// Save or Unsave a loop
export const saveLoop = async (req, res) => {
  try {
    const userId = req.userId;
    const loopId = req.params.loopId;

    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const alreadySaved = user.saved.includes(loopId);

    if (alreadySaved) {
      user.saved = user.saved.filter((id) => id.toString() !== loopId);
    } else {
      user.saved.push(loopId);
    }

    await user.save();
    const updatedUser = await User.findById(userId).select("-password");

    return res.status(200).json({
      message: alreadySaved ? "Loop unsaved successfully" : "Loop saved successfully",
      saved: !alreadySaved,
      user: updatedUser, // send updated user for frontend sync
    });
  } catch (error) {
    return res.status(500).json({ message: `saveLoop error: ${error.message}` });
  }
};
