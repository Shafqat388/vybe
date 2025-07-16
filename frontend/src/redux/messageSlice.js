import { createSlice } from "@reduxjs/toolkit"

const messageSlice = createSlice({
  name: "message",
  initialState: {
    selectedUser: null,
    messages: [],
    prevChatUsers: null
  },
  reducers: {
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload
    },
    setMessages: (state, action) => {
      state.messages = action.payload
    },
    setPrevChatUsers: (state, action) => {
      state.prevChatUsers = action.payload
    },
    updateMessageReaction: (state, action) => {
      const { messageId, reaction } = action.payload
      const index = state.messages.findIndex(m => m._id === messageId)
      if (index !== -1) {
        state.messages[index].reaction = reaction
      }
    },
    deleteMessageById: (state, action) => {
      const messageId = action.payload
      state.messages = state.messages.filter(m => m._id !== messageId)
    }
  }
})

export const {
  setSelectedUser,
  setMessages,
  setPrevChatUsers,
  updateMessageReaction,
  deleteMessageById
} = messageSlice.actions

export default messageSlice.reducer
