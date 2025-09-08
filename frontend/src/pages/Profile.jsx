import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { serverUrl } from '../App';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setProfileData, setUserData } from '../redux/userSlice';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import dp from "../assets/dp.webp";
import Nav from '../components/Nav';
import FollowButton from '../components/FollowButton';
import Post from '../components/Post';
import { setSelectedUser } from '../redux/messageSlice';
import { setLoopData } from '../redux/loopSlice';
import LoopCard from '../components/LoopCard';

function Profile() {
  const { userName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [postType, setPostType] = useState("posts");

  const { profileData, userData } = useSelector(state => state.user);
  const { postData } = useSelector(state => state.post);
  const { loopData } = useSelector(state => state.loop);

  const handleProfile = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/user/getProfile/${userName}`, { withCredentials: true });
      dispatch(setProfileData(res.data));
    } catch (error) {
      console.log(error);
    }
  };

  const getAllLoops = async () => {
    try {
      const res = await axios.get(`${serverUrl}/api/loop/getAll`, { withCredentials: true });
      dispatch(setLoopData(res.data));
    } catch (error) {
      console.log("Error fetching loops", error);
    }
  };

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true });
      dispatch(setUserData(null));
    } catch (error) {
      console.log(error);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm("Are you sure you want to delete your account? This cannot be undone.");
    if (!confirmed) return;

    try {
      await axios.delete(`${serverUrl}/api/user/deleteAccount`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/signin");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  useEffect(() => {
    handleProfile();
    getAllLoops();
  }, [userName]);

  return (
    <div className='w-full min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black '>
      {/* Topbar */}
      <div className='w-full h-[80px] flex justify-between items-center px-[30px] text-white'>
        <MdOutlineKeyboardBackspace className='cursor-pointer w-[25px] h-[25px]' onClick={() => navigate("/")} />
        <div className='font-semibold text-[20px]'>{profileData?.userName}</div>
        <div className='font-semibold cursor-pointer text-[20px] text-blue-500' onClick={handleLogOut}>Log Out</div>
      </div>

      {/* Profile Info */}
      <div className='w-full h-[150px] flex gap-[20px] lg:gap-[50px] pt-[20px] px-[10px] justify-center'>
        <div className='w-[80px] h-[80px] md:w-[140px] md:h-[140px] border-2 border-black rounded-full overflow-hidden'>
          <img src={profileData?.profileImage || dp} alt="dp" className='w-full object-cover' />
        </div>
        <div>
          <div className='font-semibold text-[22px] text-white'>{profileData?.name}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.profession }</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.bio}</div>
          <div className='text-[17px] text-[#ffffffe8]'>{profileData?.gender}</div>
        </div>
      </div>

      {/* Followers */}
      <div className='w-full h-[100px] flex justify-center gap-[60px] pt-[30px] text-white'>
        {["Posts", "Followers", "Following"].map((label, idx) => {
          const counts = [
            profileData?.posts.length || 0,
            profileData?.followers?.length || 0,
            profileData?.following?.length || 0
          ];
          return (
            <div key={idx}>
              <div className='text-[30px] font-semibold'>{counts[idx]}</div>
              <div className='text-[22px] text-[#ffffffc7]'>{label}</div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className='w-full flex flex-col items-center gap-[10px] mt-[10px]'>
        {profileData?._id === userData._id ? (
          <>
            <button onClick={() => navigate("/editprofile")} className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white rounded-2xl'>Edit Profile</button>
            <button onClick={handleDeleteAccount} className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-red-600 text-white rounded-2xl'>Delete Account</button>
          </>
        ) : (
          <div className='flex gap-[20px]'>
            <FollowButton tailwind='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white rounded-2xl' targetUserId={profileData?._id} onFollowChange={handleProfile} />
            <button className='px-[10px] min-w-[150px] py-[5px] h-[40px] bg-white rounded-2xl' onClick={() => {
              dispatch(setSelectedUser(profileData));
              navigate("/messageArea");
            }}>Message</button>
          </div>
        )}
      </div>

      {/* Post Filter Tabs */}
      <div className='w-full flex justify-center'>
        <div className='w-[90%] max-w-[500px] h-[80px] bg-white rounded-full flex justify-center items-center gap-[10px]'>
          {["posts", "saved", "loops"].map(type => (
            <div
              key={type}
              className={`${postType === type ? "bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white shadow-2xl shadow-black" : ""} w-[28%] h-[80%] flex justify-center items-center text-[19px] font-semibold rounded-full cursor-pointer hover:bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:text-white`}
              onClick={() => setPostType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Post Section */}
      <div className='w-full min-h-[100vh] flex justify-center'>
        <div className='w-full max-w-[900px] flex flex-col items-center bg-white rounded-t-[30px] gap-[20px] pt-[30px] pb-[100px]'>
          <Nav />

          {/* Posts */}
          {postType === "posts" && postData.map(post =>
            post.author?._id === profileData?._id && <Post key={post._id} post={post} />
          )}

          {/* Saved */}
          {postType === "saved" && (
            <>
              {postData.map(post =>
                userData.saved.includes(post._id) && <Post key={post._id} post={post} />
              )}
              {loopData.map(loop =>
                userData.saved.includes(loop._id) && <LoopCard key={loop._id} loop={loop} />
              )}
            </>
          )}

          {/* Loops */}
          {postType === "loops" && loopData.map(loop =>
            loop.author?._id === profileData?._id && <LoopCard key={loop._id} loop={loop} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
