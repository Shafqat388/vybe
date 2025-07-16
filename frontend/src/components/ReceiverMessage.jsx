import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { BsEmojiSmile } from "react-icons/bs";

function ReceiverMessage({ message, onReact }) {
  const { selectedUser } = useSelector(state => state.message);
  const scroll = useRef();
  const [showReactions, setShowReactions] = useState(false);

  useEffect(() => {
    scroll.current.scrollIntoView({ behavior: "smooth" });
  }, [message.message, message.image]);

  const emojiList = ["👍", "❤️", "😂", "🔥", "😢", "🎉"];

  return (
    <div
      ref={scroll}
      className='w-fit max-w-[60%] bg-[#1a1f1f] rounded-t-2xl rounded-br-2xl rounded-bl-0 px-[10px] py-[10px] relative left-0 flex flex-col gap-[10px]'
    >
      {/* Message Content */}
      {message.image && (
        <img src={message.image} alt="" className='h-[200px] object-cover rounded-2xl' />
      )}
      {message.message && (
        <div className='text-[18px] text-white break-words'>{message.message}</div>
      )}

      {/* Reaction Display */}
      {message.reaction && (
        <div className='absolute top-[-10px] left-[-10px] bg-black text-white text-[14px] rounded-full px-2 py-[2px]'>
          {message.reaction}
        </div>
      )}

      {/* Reaction Picker Icon */}
      <div className='absolute top-[5px] right-[-40px]'>
        <BsEmojiSmile
          className='text-white cursor-pointer hover:scale-110'
          onClick={() => setShowReactions(!showReactions)}
        />
      </div>

      {/* Emoji Reaction Picker */}
      {showReactions && (
        <div className='absolute top-[-50px] right-[-10px] bg-gray-800 rounded-lg px-2 py-1 flex gap-2 z-50'>
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

      {/* Sender Profile Image */}
      <div className='w-[30px] h-[30px] rounded-full cursor-pointer overflow-hidden absolute left-[-25px] bottom-[-40px]'>
        <img src={selectedUser.profileImage} alt="" className='w-full object-cover' />
      </div>
    </div>
  );
}

export default ReceiverMessage;
