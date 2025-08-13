import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { reset } from '../../redux/features/users/userSlice'; // adjust path as needed
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import AddUser from './AddUser';
import Map from './Map';
import UserList from './UserList';
import AddStacks from './AddStacks';

const ManageUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  // Reset any lingering success/error states when component mounts
  useEffect(() => {
    console.log('ManageUser mounted - resetting Redux state');
    dispatch(reset());
  }, [dispatch]);

  return (
    // --- THEME UPDATE: Changed main background to orange ---
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* --- THEME UPDATE: Removed old background class --- */}
      <div className="flex-1 flex flex-col rounded-tl-[50px] min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        {/* --- THEME UPDATE: Changed gradient to cream and text color to orange --- */}
        <div className="flex-1 p-1 sm:p-4 md:p-8 bg-gradient-to-br from-white to-[#FFF7ED] rounded-tl-[50px] min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-center text-[#DC6D18] mb-3 sm:mb-6">MANAGE USERS</h1>
          
          <div className="w-full flex flex-col gap-4 sm:gap-6">
            <div className="w-full h-[180px] xs:h-[220px] sm:h-[350px] md:h-[400px] rounded-lg shadow-lg overflow-hidden">
              <Map />
            </div>
            <div className="w-full overflow-x-auto rounded-lg">
              <UserList />
            </div>
            <div className="mt-6 sm:mt-10">
              <AddUser />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;