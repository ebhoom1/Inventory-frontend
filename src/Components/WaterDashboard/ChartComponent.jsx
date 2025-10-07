import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

// Sample data for the charts
const dummyData = [
  { time: "06:55", value: 6.5 },
  { time: "08:55", value: 7.5 },
  { time: "10:55", value: 7.9 },
  { time: "12:55", value: 7.8 },
  { time: "14:55", value: 7.4 },
  { time: "16:55", value: 6.8 },
  { time: "18:55", value: 6.2 },
  { time: "20:55", value: 6.1 },
  { time: "22:55", value: 6.0 },
];

export default function App() {
  const [timeRange, setTimeRange] = useState("Hour");

  return (
    <div className="bg-slate-50  font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            BOD - STP 
          </h1>
          <p className="text-gray-500 mt-1">
            Real-time data visualization
          </p>
        </div>

        {/* Time Range Buttons */}
        <div className="flex justify-center items-center gap-2 flex-wrap mb-8">
          {["Hour", "Day", "Month"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#236a80] ${
                timeRange === range
                  ? "bg-[#236a80] text-white shadow-md"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Modern Line Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-shadow duration-300 hover:shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Line Chart</h3>
            {/* Reduced height of the chart container */}
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dummyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  {/* Define the gradient for the area fill */}
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#236a80" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#236a80" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  
                  {/* Grid and Axes */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  {/* Reduced font size for axis ticks */}
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={{ stroke: '#d1d5db' }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={{ stroke: '#d1d5db' }} />
                  
                  {/* Tooltip Styling */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  
                  {/* Area with Gradient */}
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="transparent" 
                    fill="url(#lineGradient)" 
                  />

                  {/* The actual line */}
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="BOD - STP"
                    stroke="#236a80"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 7, strokeWidth: 2, stroke: '#fff', fill: '#236a80' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Modern Bar Chart */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transition-shadow duration-300 hover:shadow-2xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Bar Chart</h3>
            {/* Reduced height of the chart container */}
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={dummyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                  {/* Reduced font size for axis ticks */}
                  <XAxis dataKey="time" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={{ stroke: '#d1d5db' }} />
                  <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={{ stroke: '#d1d5db' }} tickLine={{ stroke: '#d1d5db' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(5px)',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                    }}
                    cursor={{fill: 'rgba(35, 106, 128, 0.1)'}}
                  />
                  <Bar
                    dataKey="value"
                    name="BOD - STP"
                    fill="#236a80"
                    barSize={25}
                    radius={[4, 4, 0, 0]} /* Rounded top corners */
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}