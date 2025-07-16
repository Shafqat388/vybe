import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsEmojiSmile } from "react-icons/bs";
import { MdDelete } from "react-icons/md";

function SenderMessage({ message, onReact, onDelete }) {
  const { userData } = useSelector(state => state.user);
  const scroll = useRef();
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    scroll.current.scrollIntoView({ behavior: "smooth" });
  }, [message.message, message.image]);

  const emojiList = ["👍", "❤️", "😂", "🔥", "😢", "🎉"];

  return (
    <div ref={scroll} className='relative w-fit max-w-[60%] bg-gradient-to-br from-[#9500ff] to-[#ff0095] rounded-t-2xl rounded-bl-2xl rounded-br-0 px-[10px] py-[10px] ml-auto flex flex-col gap-[10px]'>
      {/* Message Content */}
      {message.image && (
        <img src={message.image} alt="" className='h-[200px] object-cover rounded-2xl' />
      )}
      {message.message && (
        <div className='text-[18px] text-white break-words'>{message.message}</div>
      )}

      {/* Emoji Reaction Display */}
      {message.reaction && (
        <div className='absolute top-[-10px] right-[-10px] bg-black text-white text-[14px] rounded-full px-2 py-[2px]'>
          {message.reaction}
        </div>
      )}

      {/* Reaction & Delete Options */}
      <div className='absolute top-[5px] left-[-40px] flex flex-col gap-2'>
        <BsEmojiSmile
          className='text-white cursor-pointer hover:scale-110'
          onClick={() => setShowReactions(!showReactions)}
        />
        <MdDelete
          className='text-red-500 cursor-pointer hover:scale-110'
          onClick={onDelete}
        />
      </div>

      {/* Reaction Picker */}
      {showReactions && (
        <div className='absolute top-[-50px] left-[-10px] bg-gray-800 rounded-lg px-2 py-1 flex gap-2 z-50'>
          {emojiList.map((emoji, idx) => (
            <span
              key={idx}
              className='text-white cursor-pointer hover:scale-125 transition'
              onClick={() => {
                onReact(emoji);
                setShowReactions(false);
              }}
            >
              {emoji}
            </span>
          ))}
        </div>
      )}

      {/* Profile Image */}
      <div className='w-[30px] h-[30px] rounded-full cursor-pointer overflow-hidden absolute right-[-25px] bottom-[-40px]'>
        <img src={userData.profileImage} alt="" className='w-full object-cover' />
      </div>
    </div>
  );
}

export default SenderMessage;
