import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { reset } from '../../redux/features/users/userSlice'; // adjust path as needed
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
import Map from './Map'; // Or KeralaMap
import UserList from './UserList';
import AddUser from './AddUser';

const ManageUser = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(reset());
  }, [dispatch]);

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      {/* 1. The wrapper around the Sidebar has been REMOVED. */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />

        <main className="flex-1 p-4 md:p-8 bg-gradient-to-br from-white to-[#FFF7ED] rounded-tl-[50px]">
          <h1 className="text-lg sm:text-2xl font-bold text-center text-[#DC6D18] mb-6">
            MANAGE USERS
          </h1>
          
          <div className="flex flex-col gap-6">
            {/* 2. FIX APPLIED HERE: Added relative and z-0 to the map's container. */}
            <div className="relative z-0 w-full h-[220px] sm:h-[350px] md:h-[400px] rounded-lg shadow-lg overflow-hidden">
              <Map />
            </div>
            
            <div className="w-full overflow-x-auto rounded-lg">
              <UserList />
            </div>
            
            <div className="mt-6 sm:mt-10">
              <AddUser />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageUser;