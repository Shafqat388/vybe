import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { LuImage } from "react-icons/lu";
import { IoMdSend } from "react-icons/io";
import dp from "../assets/dp.webp";
import SenderMessage from '../components/SenderMessage';
import ReceiverMessage from '../components/ReceiverMessage';
import axios from 'axios';
import { serverUrl } from '../App';
import { setMessages } from '../redux/messageSlice';

function MessageArea() {
  const { selectedUser, messages } = useSelector(state => state.message);
  const { userData } = useSelector(state => state.user);
  const { socket } = useSelector(state => state.socket);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [frontendImage, setFrontendImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const imageInput = useRef();

  const handleImage = (e) => {
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontendImage(URL.createObjectURL(file));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("message", input);
      if (backendImage) {
        formData.append("image", backendImage);
      }

      const result = await axios.post(`${serverUrl}/api/message/send/${selectedUser._id}`, formData, { withCredentials: true });
      dispatch(setMessages([...messages, result.data]));
      setInput("");
      setBackendImage(null);
      setFrontendImage(null);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllMessages = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/message/getAll/${selectedUser._id}`, { withCredentials: true });
      dispatch(setMessages(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await axios.post(`${serverUrl}/api/message/react/${messageId}`, { emoji }, { withCredentials: true });
    } catch (error) {
      console.error("Reaction error", error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${serverUrl}/api/message/delete/${messageId}`, { withCredentials: true });
      const updated = messages.filter(m => m._id !== messageId);
      dispatch(setMessages(updated));
    } catch (error) {
      console.error("Delete error", error);
    }
  };

  useEffect(() => {
    getAllMessages();
  }, []);

  useEffect(() => {
    socket?.on("newMessage", (mess) => {
      dispatch(setMessages([...messages, mess]));
    });
    return () => socket?.off("newMessage");
  }, [messages, dispatch]);

  return (
    <div className='w-full h-[100vh] bg-gradient-to-br from-gray-800 via-gray-900 to-black relative'>

      {/* Header */}
      <div className='w-full flex items-center gap-[15px] px-[20px] py-[10px] fixed top-0 z-[100] bg-gradient-to-br from-gray-800 via-gray-900 to-black'>
        <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
        <div onClick={() => navigate(`/profile/${selectedUser.userName}`)} className='flex items-center gap-2'>
          <img src={selectedUser.profileImage || dp} alt="" className='w-[40px] h-[40px] rounded-full object-cover' />
          <div className='text-white'>
            <div className='font-semibold text-[18px]'>{selectedUser.userName}</div>
            <div className='text-gray-400 text-[14px]'>{selectedUser.name}</div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className='w-full h-[80%] pt-[100px] px-[40px] flex flex-col gap-[30px] overflow-auto'>
        {messages?.map((mess, index) => (
          mess.sender === userData._id
            ? <SenderMessage key={index} message={mess} onDelete={() => deleteMessage(mess._id)} onReact={(emoji) => addReaction(mess._id, emoji)} />
            : <ReceiverMessage key={index} message={mess} onReact={(emoji) => addReaction(mess._id, emoji)} />
        ))}
      </div>

      {/* Message Input */}
      <div className='w-full h-[80px] fixed bottom-0 flex justify-center items-center bg-gradient-to-br from-gray-800 via-gray-900 to-black z-[100]'>
        <form className='w-[90%] max-w-[800px] h-[80%] rounded-full bg-[#131616] flex items-center gap-[10px] px-[20px] relative' onSubmit={handleSendMessage}>
          {frontendImage && (
            <div className='w-[100px] h-[100px] rounded-2xl absolute top-[-120px] right-[10px] overflow-hidden'>
              <img src={frontendImage} alt="" className='h-full object-cover' />
            </div>
          )}

          <input type="file" accept='image/*' hidden ref={imageInput} onChange={handleImage} />
          <input
            type="text"
            placeholder='Message'
            className='w-full h-full px-[20px] text-[18px] text-white outline-0 bg-transparent'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div onClick={() => imageInput.current.click()}>
            <LuImage className='w-[28px] h-[28px] text-white cursor-pointer' />
          </div>
          {(input || frontendImage) && (
            <button type='submit' className='w-[60px] h-[40px] rounded-full bg-gradient-to-br from-[#9500ff] to-[#ff0095] flex items-center justify-center cursor-pointer'>
              <IoMdSend className='w-[25px] h-[25px] text-white' />
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default MessageArea;
