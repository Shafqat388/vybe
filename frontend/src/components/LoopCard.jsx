import React, { useEffect, useRef, useState } from 'react';
import { FiVolume2, FiVolumeX } from "react-icons/fi";
import { GoHeart, GoHeartFill } from "react-icons/go";
import { MdOutlineComment } from "react-icons/md";
import { IoSendSharp } from "react-icons/io5";
import { RiDeleteBinLine } from "react-icons/ri";
import { BsBookmark, BsBookmarkFill } from "react-icons/bs";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';

import dp from "../assets/dp.webp";
import FollowButton from './FollowButton';
import { serverUrl } from '../App';
import { setLoopData } from '../redux/loopSlice';
import { setUserData } from '../redux/userSlice';

function LoopCard({ loop }) {
  const videoRef = useRef();
  const commentRef = useRef();
  const dispatch = useDispatch();

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMute, setIsMute] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeart, setShowHeart] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [message, setMessage] = useState("");

  const { userData } = useSelector(state => state.user);
  const { socket } = useSelector(state => state.socket);
  const { loopData } = useSelector(state => state.loop);

  const [isSaved, setIsSaved] = useState(userData.saved?.includes(loop._id));

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    }
  };

  const handleLike = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/loop/like/${loop._id}`, { withCredentials: true });
      const updatedLoop = result.data;
      const updatedLoops = loopData.map(p => p._id === loop._id ? updatedLoop : p);
      dispatch(setLoopData(updatedLoops));
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/loop/save/${loop._id}`, { withCredentials: true });
      setIsSaved(result.data.saved);
      dispatch(setUserData(result.data.user));
    } catch (error) {
      console.log(error);
    }
  };

  const handleComment = async () => {
    try {
      const result = await axios.post(`${serverUrl}/api/loop/comment/${loop._id}`, { message }, { withCredentials: true });
      const updatedLoop = result.data;
      const updatedLoops = loopData.map(p => p._id === loop._id ? updatedLoop : p);
      dispatch(setLoopData(updatedLoops));
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${serverUrl}/api/loop/delete/${loop._id}`, { withCredentials: true });
      const updatedLoops = loopData.filter(p => p._id !== loop._id);
      dispatch(setLoopData(updatedLoops));
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = () => {
    const video = videoRef.current;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play();
      setIsPlaying(true);
    }
  };

  const handleLikeOnDoubleClick = () => {
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 600);
    if (!loop.likes.includes(userData._id)) handleLike();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentRef.current && !commentRef.current.contains(event.target)) {
        setShowComment(false);
      }
    };

    if (showComment) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showComment]);

  useEffect(() => {
    const video = videoRef.current;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        video.play();
        setIsPlaying(true);
      } else {
        video.pause();
        setIsPlaying(false);
      }
    }, { threshold: 0.6 });

    if (video) observer.observe(video);
    return () => {
      if (video) observer.unobserve(video);
    };
  }, []);

  useEffect(() => {
    socket?.on("likedLoop", (updatedData) => {
      const updatedLoops = loopData.map(p => p._id === updatedData.loopId ? { ...p, likes: updatedData.likes } : p);
      dispatch(setLoopData(updatedLoops));
    });

    socket?.on("commentedLoop", (updatedData) => {
      const updatedLoops = loopData.map(p => p._id === updatedData.loopId ? { ...p, comments: updatedData.comments } : p);
      dispatch(setLoopData(updatedLoops));
    });

    return () => {
      socket?.off("likedLoop");
      socket?.off("commentedLoop");
    };
  }, [socket, loopData, dispatch]);

  return (
    <div className='w-full lg:w-[480px] h-[100vh] flex items-center justify-center border-l-2 border-r-2 border-gray-800 relative overflow-hidden mb-[40px]'>

      {/* ❤️ Double click heart animation */}
      {showHeart && (
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 heart-animation z-50'>
          <GoHeartFill className='w-[100px] h-[100px] text-white drop-shadow-2xl' />
        </div>
      )}

      {/* 💬 Comment Drawer */}
      <div ref={commentRef} className={`absolute z-[200] bottom-0 w-full h-[480px] p-[10px] rounded-t-4xl bg-[#0e1718] transform transition-transform duration-500 ease-in-out left-0 shadow-2xl shadow-black ${showComment ? "translate-y-0" : "translate-y-[100%]"}`}>
        <h1 className='text-white text-[18px] text-center font-semibold'>Comments</h1>
        <div className='w-full h-[330px] overflow-y-auto flex flex-col gap-[15px]'>
          {loop.comments.length === 0 && <div className='text-center text-white text-[18px] font-semibold mt-[40px]'>No Comments Yet</div>}
          {loop.comments.map((com, index) => (
            <div key={index} className='flex flex-col gap-[5px] border-b border-gray-800 pb-[8px]'>
              <div className='flex items-center gap-[10px]'>
                <img src={com.author?.profileImage || dp} alt="" className='w-[30px] h-[30px] rounded-full object-cover' />
                <div className='text-white font-semibold'>{com.author?.userName}</div>
              </div>
              <div className='text-white pl-[40px]'>{com.message}</div>
            </div>
          ))}
        </div>
        <div className='w-full fixed bottom-0 h-[70px] flex items-center justify-between px-[20px]'>
          <img src={loop.author?.profileImage || dp} alt="" className='w-[35px] h-[35px] rounded-full object-cover' />
          <input type="text" placeholder='Write comment...' className='w-[85%] text-white bg-transparent border-b border-gray-500 outline-none px-2' value={message} onChange={(e) => setMessage(e.target.value)} />
          {message && <IoSendSharp onClick={handleComment} className='text-white w-[24px] h-[24px] cursor-pointer' />}
        </div>
      </div>

      {/* 🎥 Video */}
      <video
        ref={videoRef}
        autoPlay
        muted={isMute}
        loop
        src={loop?.media}
        className='w-fit max-h-fit'
        onClick={handleClick}
        onTimeUpdate={handleTimeUpdate}
        onDoubleClick={handleLikeOnDoubleClick}
      />

      {/* 🔊 Volume toggle */}
      <div className='absolute top-[10px] right-[10px] z-[100]' onClick={() => setIsMute(prev => !prev)}>
        {!isMute ? <FiVolume2 className='w-[20px] h-[20px] text-white' /> : <FiVolumeX className='w-[20px] h-[20px] text-white' />}
      </div>

      {/* ⏳ Progress bar */}
      <div className='absolute bottom-0 w-full h-[10px] bg-white-900'>
        <div className='h-full rounded-full bg-white transition-all duration-200 ease-linear' style={{ width: `${progress}%` }}></div>
      </div>

      {/* 👤 Author Info */}
      <div className='w-full absolute bottom-[10px] px-[5px] text-lg flex-col gap[4px]'>
        <div className='flex items-center gap-[10px]'>
          <img src={loop.author?.profileImage || dp} alt="" className='w-[30px] h-[30px] rounded-full object-cover' />
          <div className='text-white font-bold'>{loop.author.userName}</div>
          {loop.author._id !== userData._id && (
            <FollowButton
              targetUserId={loop.author?._id}
              tailwind="px-[10px] py-[4px] text-white border text-xs rounded-full border-white"
            />
          )}
        </div>
        <div className='text-white text-base mt-3 truncate font-serif'>{loop.caption}</div>
      </div>

      {/* 👉 Action Buttons */}
      <div className='absolute right-0 bottom-[100px] flex flex-col gap-[18px] items-center px-3 text-white'>
        <div className='flex flex-col items-center cursor-pointer' onClick={handleLike}>
          {!loop.likes.includes(userData._id)
            ? <GoHeart className='w-[25px] h-[25px]' />
            : <GoHeartFill className='w-[25px] h-[25px] text-red-600' />}
          <span className='text-xs'>{loop.likes.length}</span>
        </div>

        <div className='flex flex-col items-center cursor-pointer' onClick={() => setShowComment(true)}>
          <MdOutlineComment className='w-[25px] h-[25px]' />
          <span className='text-xs'>{loop.comments.length}</span>
        </div>

        <div className='flex flex-col items-center cursor-pointer' onClick={handleSave}>
          {!isSaved
            ? <BsBookmark className='w-[25px] h-[25px]' />
            : <BsBookmarkFill className='w-[25px] h-[25px] text-black-900' />}
        </div>

        {loop.author._id === userData._id && (
          <div className='flex flex-col items-center cursor-pointer' onClick={handleDelete}>
            <RiDeleteBinLine className='w-[25px] h-[25px]' />
          </div>
        )}
      </div>
    </div>
  );
}

export default LoopCard;
