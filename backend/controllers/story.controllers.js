import uploadOnCloudinary from "../config/cloudinary.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";

// ✅ Upload Story (media, text, or both)
export const uploadStory = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    // If user already has a story, delete it (overwrite behavior)
    if (user.story) {
      await Story.findByIdAndDelete(user.story);
      user.story = null;
    }

    const { mediaType, text } = req.body;
    let media;

    // ✅ Handle media upload if file exists
    if (req.file) {
      media = await uploadOnCloudinary(req.file.path);
    }

    // ✅ Validation: Require either media or text
    if (!media && (!text || text.trim() === "")) {
      return res.status(400).json({ message: "Story must include media or text." });
    }

    // ✅ Determine mediaType
    let finalMediaType = mediaType;
    if (!media && text) finalMediaType = "text";

    const story = await Story.create({
      author: req.userId,
      mediaType: finalMediaType,
      media: media || undefined,
      text: text || undefined,
    });

    user.story = story._id;
    await user.save();

    const populatedStory = await Story.findById(story._id)
      .populate("author", "name userName profileImage")
      .populate("viewers", "name userName profileImage");

    return res.status(200).json(populatedStory);
  } catch (error) {
    return res.status(500).json({ message: "story upload error", error: error.message });
  }
};

// ✅ View Story (track viewer)
export const viewStory = async (req, res) => {
  try {
    const storyId = req.params.storyId;
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(400).json({ message: "story not found" });
    }

    const viewersIds = story.viewers.map(id => id.toString());
    if (!viewersIds.includes(req.userId.toString())) {
      story.viewers.push(req.userId);
      await story.save();
    }

    const populatedStory = await Story.findById(story._id)
      .populate("author", "name userName profileImage")
      .populate("viewers", "name userName profileImage");

    return res.status(200).json(populatedStory);
  } catch (error) {
    return res.status(500).json({ message: "story view error" });
  }
};

// ✅ Get Story by User Username
export const getStoryByUserName = async (req, res) => {
  try {
    const userName = req.params.userName;
    const user = await User.findOne({ userName });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    const story = await Story.find({
      author: user._id,
    }).populate("viewers author");

    return res.status(200).json(story);
  } catch (error) {
    return res.status(500).json({ message: "story get by userName error" });
  }
};

// ✅ Get All Stories from Following Users
export const getAllStories = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const followingIds = currentUser.following;

    const stories = await Story.find({
      author: { $in: followingIds },
    })
      .populate("viewers author")
      .sort({ createdAt: -1 });

    return res.status(200).json(stories);
  } catch (error) {
    return res.status(500).json({ message: "All story get error" });
  }
};

// ✅ Delete Story
export const deleteStory = async (req, res) => {
  try {
    const storyId = req.params.storyId;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Story not found" });
    }

    // Only allow the author to delete their own story
    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to delete this story" });
    }

    await Story.findByIdAndDelete(storyId);

    const user = await User.findById(req.userId);
    if (user.story?.toString() === storyId) {
      user.story = null;
      await user.save();
    }

    return res.status(200).json({ message: "Story deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete story", error: error.message });
  }
};
