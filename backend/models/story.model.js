import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mediaType: {
      type: String,
      enum: ["image", "video", "text"],
      required: true,
    },

    media: {
      type: String,
      default: null,
    },

    // ✅ Optional text content
    text: {
      type: String,
      default: null,
    },

    // ✅ Users who viewed the story
    viewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    // ✅ Set story to expire after 24 hours
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 86400, // 24 hours in seconds
    },
  },
  { timestamps: true }
);

// ✅ Custom validation: Require at least media or text
storySchema.pre("validate", function (next) {
  if (!this.media && (!this.text || this.text.trim() === "")) {
    next(new Error("Story must include media or text."));
  } else {
    next();
  }
});

const Story = mongoose.model("Story", storySchema);
export default Story;
