import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdOutlineKeyboardBackspace } from "react-icons/md";
import { useDispatch, useSelector } from 'react-redux';
import NotificationCard from '../components/NotificationCard';
import axios from 'axios';
import { serverUrl } from '../App';
import { setNotificationData } from '../redux/userSlice';

function Notifications() {
  const navigate = useNavigate();
  const { notificationData } = useSelector(state => state.user);
  const dispatch = useDispatch();

  const fetchNotifications = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/getAllNotifications`, { withCredentials: true });
      dispatch(setNotificationData(result.data));
    } catch (error) {
      console.log(error);
    }
  };

  const markAsRead = async () => {
    try {
      const ids = notificationData.map((n) => n._id);
      await axios.post(`${serverUrl}/api/user/markAsRead`, { notificationId: ids }, { withCredentials: true });
      await fetchNotifications();
    } catch (error) {
      console.log(error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${serverUrl}/api/user/deleteNotification/${id}`, { withCredentials: true });
      fetchNotifications(); // refresh list after delete
    } catch (error) {
      console.log("Delete notification error:", error);
    }
  };

  useEffect(() => {
    markAsRead();
  }, []);

  return (
    <div className='w-full h-[100vh] bg-black overflow-auto'>
      <div className='w-full h-[80px] flex items-center gap-[20px] px-[20px] lg:hidden'>
        <MdOutlineKeyboardBackspace className='text-white cursor-pointer w-[25px] h-[25px]' onClick={() => navigate(`/`)} />
        <h1 className='text-white text-[20px] font-semibold'>Notifications</h1>
      </div>

      <div className='w-full flex flex-col gap-[20px] px-[10px]'>
        {notificationData?.map((noti, index) => (
          <NotificationCard
            key={index}
            noti={noti}
            onDelete={() => deleteNotification(noti._id)}
          />
        ))}
      </div>
    </div>
  );
}

export default Notifications;
