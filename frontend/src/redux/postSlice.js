import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { serverUrl } from "../App"; // ✅ Make sure this is correct

// ✅ Async thunk to delete a post
export const deletePost = createAsyncThunk(
  "post/deletePost",
  async (postId, { rejectWithValue }) => {
    try {
      await axios.delete(`${serverUrl}/api/post/delete/${postId}`, {
        withCredentials: true, // to send cookies/token
      });
      return postId; // return deleted post's ID
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delete failed");
    }
  }
);

const postSlice = createSlice({
  name: "post",
  initialState: {
    postData: null,
    error: null,
  },
  reducers: {
    setPostData: (state, action) => {
      state.postData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deletePost.fulfilled, (state, action) => {
        if (state.postData) {
          state.postData = state.postData.filter(
            (post) => post._id !== action.payload
          );
        }
        state.error = null; // clear error if any
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
        console.error("Delete failed:", action.payload); // helpful debug
      });
  },
});

export const { setPostData } = postSlice.actions;
export default postSlice.reducer;
