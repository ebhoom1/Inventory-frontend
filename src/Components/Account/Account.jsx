import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';

const Account = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = {
    fname: 'Sam',
    email: 'sam.developer@example.com',
    companyName: 'Dev Solutions Inc.',
    userName: 'sam_dev',
    modelName: 'Pro Analyzer X1',
    modelImage: 'https://images.unsplash.com/photo-1526948531399-320e7e40f05d?w=500&q=80',
    subscriptionDate: '2024-06-05',
    industryType: 'Software Development',
    analyserImage: 'https://images.unsplash.com/photo-1581092334632-d87a31a57594?w=500&q=80',
    profileImage: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=500&q=80',
  };

  return (
    <div className="flex min-h-screen bg-[#DC6D18]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col bg-main-content-bg rounded-tl-[50px]">
        <Header onSidebarToggle={() => setSidebarOpen((open) => !open)} />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-white to-[#f0f7fa] rounded-tl-[50px]">
          <div className="relative bg-[#FFF7ED] rounded-2xl shadow-lg max-w-xl w-full p-8 pt-20 mt-12 bg-gradient-to-br from-[#236a80]/10 to-white">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-lg p-2">
              <img
                src={user.profileImage}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
            {/* User Information */}
            <div className="text-center mt-4">
              <h3 className="mb-2 text-2xl font-bold text-[#DC6D18]">{user.fname}</h3>
              <p className="text-gray-600 mb-1">{user.email}</p>
              <p className="text-gray-500 mb-3">{user.companyName}</p>
            </div>
            {/* Additional Details */}
            <div className="text-gray-700 mt-6 space-y-3">
              <p><span className="font-semibold">User ID:</span> {user.userName}</p>
              <p><span className="font-semibold">Model Name:</span> {user.modelName}</p>
             
              <p><span className="font-semibold">Subscription Date:</span> {user.subscriptionDate}</p>
              <p><span className="font-semibold">Industry Type:</span> {user.industryType}</p>
              <p><span className="font-semibold">Analyser Technology:</span> N/A</p>
            
              <div className="flex items-center gap-3">
                <span className="font-semibold">Password:</span> ************
                <Link to="/reset">
                  <button className="ml-2 bg-[#DC6D18] text-white px-4 py-1 rounded hover:bg-[#DC6D18] transition">Change Password</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;