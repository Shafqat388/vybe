import React, { useRef, useState } from 'react';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { FiPlusSquare } from "react-icons/fi";
import VideoPlayer from '../components/VideoPlayer';
import axios from 'axios';
import { serverUrl } from '../App';
import { useDispatch, useSelector } from 'react-redux';
import { setPostData } from '../redux/postSlice';
import { setCurrentUserStory } from '../redux/storySlice';
import { setLoopData } from '../redux/loopSlice';
import { ClipLoader } from 'react-spinners';

function Upload() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { postData } = useSelector(state => state.post);
  const { loopData } = useSelector(state => state.loop);

  const [uploadType, setUploadType] = useState("post");
  const [frontendMedia, setFrontendMedia] = useState(null);
  const [backendMedia, setBackendMedia] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);

  const mediaInput = useRef();

  const handleMedia = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.includes("image")) {
      setMediaType("image");
    } else {
      setMediaType("video");
    }

    setBackendMedia(file);
    setFrontendMedia(URL.createObjectURL(file));
  };

  const uploadPost = async () => {
    try {
      const formData = new FormData();
      if (caption.trim()) formData.append("caption", caption);
      if (backendMedia) {
        formData.append("mediaType", mediaType);
        formData.append("media", backendMedia);
      }

      const result = await axios.post(`${serverUrl}/api/post/upload`, formData, { withCredentials: true });
      dispatch(setPostData([...postData, result.data]));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const uploadStory = async () => {
    if (!backendMedia && !caption.trim()) return alert("Story must include text or media!");
    try {
      const formData = new FormData();

      if (backendMedia) {
        formData.append("mediaType", mediaType);
        formData.append("media", backendMedia);
      }

      if (caption.trim()) {
        formData.append("text", caption);
        if (!backendMedia) {
          formData.append("mediaType", "text");
        }
      }

      const result = await axios.post(`${serverUrl}/api/story/upload`, formData, { withCredentials: true });
      dispatch(setCurrentUserStory(result.data));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const uploadLoop = async () => {
    if (!backendMedia) return alert("Loop must include video!");
    try {
      const formData = new FormData();
      if (caption.trim()) formData.append("caption", caption);
      formData.append("media", backendMedia);

      const result = await axios.post(`${serverUrl}/api/loop/upload`, formData, { withCredentials: true });
      dispatch(setLoopData([...loopData, result.data]));
      setLoading(false);
      navigate("/");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleUpload = () => {
    setLoading(true);
    if (uploadType === "post") uploadPost();
    else if (uploadType === "story") uploadStory();
    else uploadLoop();
  };

  const canUploadPost = uploadType === "post" && (caption.trim() || backendMedia);
  const canUploadStory = uploadType === "story" && (backendMedia || caption.trim());
  const canUploadLoop = uploadType === "loop" && backendMedia;

  return (
    <div className='w-full h-screen overflow-y-auto bg-black flex flex-col items-center pb-[100px]'>
      {/* Header */}
      <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px]'>
        <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
        <h1 className='text-white text-[20px] font-semibold'>Upload Media</h1>
      </div>

      {/* Upload Type Selector */}
      <div className='w-[90%] max-w-[600px] h-[80px] bg-white rounded-full flex justify-around items-center gap-[10px]'>
        {["post", "story", "loop"].map(type => (
          <div
            key={type}
            className={`${uploadType === type ? "bg-black text-white shadow-2xl shadow-black" : ""} w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold hover:bg-black rounded-full hover:text-white cursor-pointer hover:shadow-2xl hover:shadow-black`}
            onClick={() => {
              setUploadType(type);
              setCaption("");
              setFrontendMedia(null);
              setBackendMedia(null);
            }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        ))}
      </div>

      {/* Upload Media Placeholder */}
      {(uploadType !== "post" || !frontendMedia) && (
        <div
          className='w-[80%] max-w-[500px] h-[250px] bg-[#0e1316] border-gray-800 border-2 flex flex-col items-center justify-center gap-[8px] mt-[15vh] rounded-2xl cursor-pointer hover:bg-[#353a3d]'
          onClick={() => mediaInput.current.click()}
        >
          <input
            type="file"
            accept={uploadType === "loop" ? "video/*" : "image/*,video/*"}
            hidden
            ref={mediaInput}
            onChange={handleMedia}
          />
          <FiPlusSquare className='text-white cursor-pointer w-[25px] h-[25px]' />
          <div className='text-white text-[19px] font-semibold'>Upload {uploadType}</div>
        </div>
      )}

      {/* Media Preview */}
      {frontendMedia && (
        <div className='w-[80%] max-w-[500px] flex flex-col items-center justify-center mt-[5vh]'>
          {mediaType === "image" && <img src={frontendMedia} alt="" className='h-[60%] rounded-2xl' />}
          {mediaType === "video" && <VideoPlayer media={frontendMedia} />}
        </div>
      )}

      {/* Caption / Text Input */}
      <input
        type='text'
        className='w-[80%] max-w-[500px] border-b-gray-400 border-b-2 outline-none px-[10px] py-[10px] text-white mt-[30px]'
        placeholder='Write caption or story text...'
        onChange={(e) => setCaption(e.target.value)}
        value={caption}
      />

      {/* Upload Button */}
      {(canUploadPost || canUploadStory || canUploadLoop) && (
        <button
          className='px-[10px] w-[60%] max-w-[400px] py-[5px] h-[50px] bg-white mt-[50px] cursor-pointer rounded-2xl'
          onClick={handleUpload}
        >
          {loading ? <ClipLoader size={30} color='black' /> : `Upload ${uploadType}`}
        </button>
      )}
    </div>
  );
}

export default Upload;
