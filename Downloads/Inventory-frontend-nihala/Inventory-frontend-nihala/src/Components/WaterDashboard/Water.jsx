import React from 'react';
import { useNavigate } from 'react-router-dom';
import ChartComponent from './ChartComponent'; // Assuming path
import ParameterExceedence from '../ParameterExceedence/ParameterExceedence'; // Assuming path

function WaterDashboard() {
  const navigate = useNavigate();

  return (
    <>
      {/* Main content area */}
      <div className="flex flex-wrap justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">EFFLUENT DASHBOARD</h1>
          <p className="text-sm text-gray-500">last updated: 12:45 pm</p>
        </div>
        <button className="flex items-center gap-1 bg-[#236a80] text-white px-4 py-2 rounded-lg hover:bg-[#1d596a] transition-colors shadow-md" onClick={() => navigate('/addparameter')}>
          <span className="text-lg font-bold">+</span> Add Parameter Exceedence
        </button>
      </div>

      {/* Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-xl font-semibold text-gray-700 h-32 border-2 border-dotted border-[#236a80]">
          <div className="text-[#236a80] font-bold">PH</div>
          <div>7</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-xl font-semibold text-gray-700 h-32 border-2 border-dotted border-[#236a80]">
          <div className="text-[#236a80] font-bold">BOD</div>
          <div>30</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-xl font-semibold text-gray-700 h-32 border-2 border-dotted border-[#236a80]">
          <div className="text-[#236a80] font-bold">TSS</div>
          <div>67</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-xl font-semibold text-gray-700 h-32 border-2 border-dotted border-[#236a80]">
          <div className="text-[#236a80] font-bold">Temperature</div>
          <div>30</div>
        </div>
      </div>

      <div className="my-8">
        <ChartComponent />
      </div>
      
      <ParameterExceedence/>
    </>
  );
}

export default WaterDashboard;