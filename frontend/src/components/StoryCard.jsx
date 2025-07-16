import React, { useEffect, useState, useRef } from 'react';
import dp from "../assets/dp.webp";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaEye } from "react-icons/fa6";
import axios from 'axios';
import { serverUrl } from '../App';

function StoryCard({ storyData }) {
  const { userData } = useSelector(state => state.user);
  const [showViewers, setShowViewers] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          navigate("/");
          return 100;
        }
        return prev + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [isPaused, navigate]);

  useEffect(() => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleDeleteStory = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this story?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${serverUrl}/api/story/${storyData._id}`, { withCredentials: true });
      navigate("/");
    } catch (error) {
      console.error("Error deleting story:", error);
    }
  };

  const handlePressStart = () => {
    setIsPaused(true);
    setIsVideoPlaying(false);
  };

  const handlePressEnd = () => {
    setIsPaused(false);
    setIsVideoPlaying(true);
  };

  return (
    <div className='w-full max-w-[500px] h-[100vh] border-x-2 border-gray-800 pt-[10px] relative flex flex-col justify-center'>

      {/* Header */}
      <div className='flex items-center gap-[10px] absolute top-[30px] px-[10px] w-full justify-between z-10'>
        <div className='flex items-center gap-[10px]'>
          <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
          <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full overflow-hidden'>
            <img src={storyData?.author?.profileImage || dp} alt="" className='w-full object-cover' />
          </div>
          <div className='w-[120px] font-semibold truncate text-white'>{storyData?.author?.userName}</div>
        </div>

        {storyData?.author?.userName === userData?.userName && (
          <div className='relative'>
            <BsThreeDotsVertical
              className='text-white cursor-pointer w-[25px] h-[25px]'
              onClick={() => setShowMenu(prev => !prev)}
            />
            {showMenu && (
              <div className='absolute right-0 top-[30px] bg-white text-black rounded-md shadow-lg z-10'>
                <div className='px-4 py-2 hover:bg-gray-200 cursor-pointer' onClick={handleDeleteStory}>
                  Delete Story
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className='absolute top-[10px] w-full h-[5px] bg-gray-900 z-10'>
        <div className='h-full bg-white transition-all duration-200 ease-linear' style={{ width: `${progress}%` }} />
      </div>

      {/* Story Content */}
      {!showViewers && (
        <>
          <div
            className='w-full h-full flex items-center justify-center relative'
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
          >
            {storyData?.mediaType === "image" && (
              <img src={storyData?.media} alt="" className='w-[90%] max-h-[80vh] rounded-2xl object-contain' />
            )}

            {storyData?.mediaType === "video" && (
              <>
                <video
                  ref={videoRef}
                  src={storyData?.media}
                  className='w-[90%] max-h-[80vh] rounded-2xl object-contain'
                  autoPlay
                  playsInline
                  loop
                  controls={false}
                />
                {/* Mute/Unmute Symbol Top-Right */}
                <div
                  onClick={() => setIsMuted(prev => !prev)}
                  className='absolute top-[20px] right-[40px] text-white text-lg /40 rounded-full p-2 cursor-pointer z-20'
                >
                  {isMuted ? "🔇" : "🔊"}
                </div>
              </>
            )}

            {storyData?.mediaType === "text" && (
              <div className='bg-gradient-to-br from-[#151515] to-[#333] text-white text-2xl p-6 rounded-2xl text-center w-[90%] max-h-[80vh] overflow-y-auto'>
                {storyData?.text}
              </div>
            )}

            {/* Caption shown centered at bottom */}
            {storyData?.caption && (
               <div className='absolute bottom-[80px] w-full text-center px-4 z-20'>
                <p className='text-white text-base bg-black/70 inline-block px-4 py-2 rounded-md max-w-[90%]'>
                {storyData.caption}
                </p>
               </div>
            )}
          </div>

          {/* Viewers */}
          {storyData?.author?.userName === userData?.userName && (
            <div
              className='absolute w-full flex items-center gap-[10px] text-white h-[70px] bottom-0 p-2 left-0 cursor-pointer z-10'
              onClick={() => setShowViewers(true)}
            >
              <div className='flex items-center gap-[5px]'>
                <FaEye /> {storyData?.viewers?.length}
              </div>
              <div className='flex relative ml-2'>
                {storyData?.viewers?.slice(0, 3).map((viewer, index) => (
                  <div
                    key={viewer._id}
                    className='w-[30px] h-[30px] border-2 border-black rounded-full overflow-hidden absolute'
                    style={{ left: `${index * 20}px` }}
                  >
                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Viewers List */}
      {showViewers && (
        <>
          <div className='w-full h-[30%] flex items-center justify-center mt-[100px] cursor-pointer py-[30px]' onClick={() => setShowViewers(false)}>
            {storyData?.mediaType === "image" && (
              <img src={storyData?.media} alt="" className='h-full rounded-2xl object-contain' />
            )}
            {storyData?.mediaType === "video" && (
              <video
                src={storyData?.media}
                className='h-full rounded-2xl object-contain'
                autoPlay
                playsInline
                loop
                controls={false}
                muted
              />
            )}
            {storyData?.mediaType === "text" && (
              <div className='text-white text-xl'>{storyData?.text}</div>
            )}
          </div>

          <div className='w-full h-[70%] border-t-2 border-t-gray-800 p-[20px] overflow-auto'>
            <div className='text-white flex items-center gap-[10px]'>
              <FaEye /><span>{storyData?.viewers?.length}</span><span>Viewers</span>
            </div>
            <div className='w-full flex flex-col gap-[10px] pt-[20px]'>
              {storyData?.viewers?.map((viewer) => (
                <div key={viewer._id} className='w-full flex items-center gap-[20px]'>
                  <div className='w-[30px] h-[30px] md:w-[40px] md:h-[40px] border-2 border-black rounded-full overflow-hidden'>
                    <img src={viewer?.profileImage || dp} alt="" className='w-full object-cover' />
                  </div>
                  <div className='w-[120px] font-semibold truncate text-white'>{viewer?.userName}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default StoryCard;
