import React from 'react';
import { RiDeleteBin6Line } from "react-icons/ri";
import dp from "../assets/dp.webp";

function NotificationCard({ noti, onDelete }) {
  return (
    <div className='w-full flex justify-between items-center p-[10px] min-h-[60px] bg-gray-800 rounded-2xl shadow-md'>

      {/* Sender Info & Message */}
      <div className='flex gap-[10px] items-center'>
        <div className='w-[45px] h-[45px] border-2 border-black rounded-full cursor-pointer overflow-hidden'>
          <img src={noti.sender?.profileImage || dp} alt="dp" className='w-full h-full object-cover' />
        </div>

        <div className='flex flex-col'>
          <h1 className='text-[16px] text-white font-semibold'>{noti.sender?.userName}</h1>
          <div className='text-[14px] text-gray-300'>{noti.message}</div>
        </div>
      </div>

      {/* Notification Media or Icon */}
      <div className='flex items-center gap-2'>
        {noti.loop ? (
          <div className='w-[40px] h-[40px] rounded overflow-hidden border border-black'>
            <video src={noti.loop.media} muted loop className='w-full h-full object-cover' />
          </div>
        ) : noti.post ? (
          noti.post.mediaType === "image" ? (
            <div className='w-[40px] h-[40px] rounded overflow-hidden border border-black'>
              <img src={noti.post.media} alt="media" className='w-full h-full object-cover' />
            </div>
          ) : (
            <div className='w-[40px] h-[40px] rounded overflow-hidden border border-black'>
              <video src={noti.post.media} muted loop className='w-full h-full object-cover' />
            </div>
          )
        ) : null}

        {/* Delete Icon */}
        <RiDeleteBin6Line
          className='text-white w-[22px] h-[22px] cursor-pointer hover:text-red-500'
          onClick={onDelete}
          title='Delete notification'
        />
      </div>
    </div>
  );
}

export default NotificationCard;
