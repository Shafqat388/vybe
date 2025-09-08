import React, { useEffect, useState } from 'react';
import dp from "../assets/dp.webp";
import VideoPlayer from './VideoPlayer';
import { GoHeart, GoHeartFill } from "react-icons/go";
import { MdOutlineComment, MdOutlineBookmarkBorder } from "react-icons/md";
import { GoBookmarkFill } from "react-icons/go";
import { IoSendSharp } from "react-icons/io5";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { serverUrl } from '../App';
import { setPostData, deletePost } from '../redux/postSlice';
import { setUserData } from '../redux/userSlice';
import FollowButton from './FollowButton';
import { useNavigate } from 'react-router-dom';

function Post({ post }) {
  const { userData } = useSelector(state => state.user);
  const { postData } = useSelector(state => state.post);
  const { socket } = useSelector(state => state.socket);
  const [showComment, setShowComment] = useState(false);
  const [message, setMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/like/${post._id}`, { withCredentials: true });
      const updatedPost = result.data;
      const updatedPosts = postData?.map(p => p._id === post._id ? updatedPost : p);
      dispatch(setPostData(updatedPosts));
    } catch (error) {
      console.log("Like error:", error);
    }
  };

  const handleComment = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/post/comment/${post._id}`, { message }, { withCredentials: true });
      const updatedPost = result.data;
      const updatedPosts = postData?.map(p => p._id === post._id ? updatedPost : p);
      dispatch(setPostData(updatedPosts));
      setMessage("");
    } catch (error) {
      console.log("Comment error:", error.response);
    }
  };

  const handleSaved = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/post/saved/${post._id}`, { withCredentials: true });
      dispatch(setUserData(result.data));
    } catch (error) {
      console.log("Save error:", error.response);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
      try {
        await dispatch(deletePost(post._id)).unwrap();
        console.log("Post deleted!");
      } catch (err) {
        console.error("Delete failed:", err);
        alert("Failed to delete post: " + err);
      }
    }
  };

  useEffect(() => {
    socket?.on("likedPost", (updatedData) => {
      const updatedPosts = postData?.map(p => p._id === updatedData.postId ? { ...p, likes: updatedData.likes } : p);
      dispatch(setPostData(updatedPosts));
    });

    socket?.on("commentedPost", (updatedData) => {
      const updatedPosts = postData?.map(p => p._id === updatedData.postId ? { ...p, comments: updatedData.comments } : p);
      dispatch(setPostData(updatedPosts));
    });

    socket?.on("postDeleted", ({ postId }) => {
      const updatedPosts = postData?.filter(p => p._id !== postId);
      dispatch(setPostData(updatedPosts));
    });

    return () => {
      socket?.off("likedPost");
      socket?.off("commentedPost");
      socket?.off("postDeleted");
    };
  }, [socket, postData, dispatch]);

  return (
    <div className='w-[90%] flex flex-col gap-[10px] bg-gradient-to-br from-[#2c3e50] to-[#4ca1af] text-white rounded-xl p-4 shadow-xl" items-center shadow-2xl shadow-[#00000058] rounded-2xl pb-[20px]'>
      
      {/* Header */}
      <div className='w-full h-[80px] flex justify-between items-center px-[10px]'>
        <div className='flex justify-center items-center gap-[10px] cursor-pointer'
          onClick={() => navigate(`/profile/${post.author?.userName}`)}>
          <div className='w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden'>
            <img src={post.author?.profileImage || dp} alt="" className='w-full object-cover' />
          </div>
          <div className='w-[150px] font-semibold text-black  text-xl hover:scale-105 transition-transfrom duration-200 cursor-pointer truncate'>{post.author.userName}</div>
        </div>

        {userData._id !== post.author._id ? (
          <FollowButton
            tailwind={'px-[10px] minw-[60px] md:min-w-[100px] py-[5px] h-[30px] md:h-[40px] bg-gray-900 text-white rounded-2xl text-[14px] md:text-[16px]'}
            targetUserId={post.author._id}
          />
        ) : (
          <button
            className=" px-[10px] minw-[60px] md:min-w-[100px] py-[5px] h-[30px] md:h-[40px] bg-gray-900 text-white  rounded-2xl text-[14px] md:text-[16px]"
            
            onClick={handleDelete}
          >
            Delete
          </button>
        )}
      </div>

      {/* TEXT POST ONLY */}
      {!post.media && !post.mediaType && post.caption && (
        <div className='w-[90%] flex items-center justify-center min-h-[200px] mt-2'>
          <div className='bg-gray-400 p-4 rounded-lg text-center text-black text-[18px] font-medium w-full'>
            {post.caption}
          </div>
        </div>
      )}

      {/* MEDIA POST WITH CAPTION */}
      {post.media && post.mediaType && (
        <>
          {/* Caption on top */}
          {post.caption && (
            <div className='w-full px-[20px] flex flex-col items-start gap-[5px]'>
          
              <span className='text-[15px] text-white/85 font-medium leading-snug italic tracking-wide'>{post.caption}</span>
            </div>
          )}

          {/* Media below caption */}
          <div className='w-[90%] flex items-center justify-center min-h-[200px] mt-2'>
            {post.mediaType === "image" ? (
              <img src={post.media} alt="" className='w-[80%] rounded-2xl object-cover' />
            ) : (
              <VideoPlayer media={post.media} />
            )}
          </div>
        </>
      )}

      {/* Like, Comment, Save */}
      <div className='w-full h-[60px] flex justify-between items-center px-[20px] mt-[10px]'>
        <div className='flex justify-center items-center gap-[10px]'>
          <div className='flex justify-center items-center gap-[5px]'>
            {!post.likes.includes(userData._id) ? (
              <GoHeart className='w-[25px] cursor-pointer h-[25px]' onClick={handleLike} />
            ) : (
              <GoHeartFill className='w-[25px] cursor-pointer h-[25px] text-red-600' onClick={handleLike} />
            )}
            <span>{post.likes.length}</span>
          </div>
          <div className='flex justify-center items-center gap-[5px] cursor-pointer' onClick={() => setShowComment(prev => !prev)}>
            <MdOutlineComment className='w-[25px] h-[25px]' />
            <span>{post.comments.length}</span>
          </div>
        </div>
        <div onClick={handleSaved}>
          {!userData.saved.includes(post?._id) ? (
            <MdOutlineBookmarkBorder className='w-[25px] cursor-pointer h-[25px]' />
          ) : (
            <GoBookmarkFill className='w-[25px] cursor-pointer h-[25px]' />
          )}
        </div>
      </div>

      {/* Comments */}
      {showComment && (
        <div className='w-full flex flex-col gap-[30px] pb-[20px]'>
          <div className='w-full h-[80px] flex items-center justify-between px-[20px] relative'>
            <div className='w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden'>
              <img src={post.author?.profileImage || dp} alt="" className='w-full object-cover' />
            </div>
            <input
              type="text"
              className='px-[10px] border-b-2 border-b-gray-500 w-[90%] outline-none h-[40px]'
              placeholder='Write comment...'
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            <button className='absolute right-[20px] cursor-pointer' onClick={handleComment}>
              <IoSendSharp className='w-[25px] h-[25px]' />
            </button>
          </div>

          <div className='w-full max-h-[300px] overflow-y-auto'>
            {post.comments?.map((com, index) => (
              <div key={index} className='w-full px-[20px] py-[20px] flex items-center gap-[20px] border-b-2 border-b-gray-200'>
                <div className='w-[40px] h-[40px] md:w-[60px] md:h-[60px] border-2 border-black rounded-full overflow-hidden'>
                  <img src={com.author?.profileImage || dp} alt="" className='w-full object-cover' />
                </div>
                <div>{com.message}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;
