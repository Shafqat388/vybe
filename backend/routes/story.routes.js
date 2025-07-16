import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import {
  getAllStories,
  getStoryByUserName,
  uploadStory,
  viewStory,
  deleteStory, // ✅ Import delete controller
} from "../controllers/story.controllers.js";

const storyRouter = express.Router();

// ✅ Upload a story (image/video or text)
storyRouter.post("/upload", isAuth, upload.single("media"), uploadStory);

// ✅ Get a user's story by username
storyRouter.get("/getByUserName/:userName", isAuth, getStoryByUserName);

// ✅ Get all stories from following users
storyRouter.get("/getAll", isAuth, getAllStories);

// ✅ View a story (track as viewed)
storyRouter.get("/view/:storyId", isAuth, viewStory);

// ✅ Delete a story (only by the author)
storyRouter.delete("/:storyId", isAuth, deleteStory);

export default storyRouter;
