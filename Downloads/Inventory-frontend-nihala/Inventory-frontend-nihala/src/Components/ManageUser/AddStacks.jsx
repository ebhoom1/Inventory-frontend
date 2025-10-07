import React, { useState } from 'react';

const staticCompanies = [
  { _id: '1', companyName: 'Eco Solutions Inc.' },
  { _id: '2', companyName: 'Aqua Pura Ltd.' },
  { _id: '3', companyName: 'GreenScape Tech' },
  { _id: '4', companyName: 'Enviro-Monitor Corp.' },
];

const AddStacks = () => {
  const [stacks, setStacks] = useState([{ stackName: '', stationType: '' }]);
  const [selectedCompany, setSelectedCompany] = useState('');

  const handleInputChange = (index, field, value) => {
    const newStacks = [...stacks];
    newStacks[index][field] = value;
    setStacks(newStacks);
  };

  const handleAddInput = () => {
    setStacks([...stacks, { stackName: '', stationType: '' }]);
  };

  const handleRemoveInput = (index) => {
    const newStacks = stacks.filter((_, i) => i !== index);
    setStacks(newStacks);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // Save logic here
    alert('Data saved to console!');
    console.log({ company: selectedCompany, stacks });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    setSelectedCompany('');
    setStacks([{ stackName: '', stationType: '' }]);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8  mx-auto">
      <h2 className="text-xl font-bold text-[#236a80] mb-6 text-center">Add Stacks</h2>
      <form onSubmit={handleSave}>
        {/* Select Company Dropdown */}
        <div className="mb-6 relative flex items-center justify-center">
          <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Select Company</span>
          <select
            id="company"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-sm text-gray-700 bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]"
          >
            <option value="" className="text-gray-400">-- Choose a Company --</option>
            {staticCompanies.map((company) => (
              <option key={company._id} value={company.companyName} className="text-gray-700">
                {company.companyName}
              </option>
            ))}
          </select>
        </div>
        {/* Dynamic Stack Name and Station Type Inputs */}
        <div className="space-y-4 mb-6">
          {stacks.map((stack, index) => (
            <div key={index} className="flex flex-col md:flex-row md:items-center gap-4 relative">
              {/* Stack Name Input */}
              <div className="relative flex-1 flex items-center justify-center">
                <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Stack Name</span>
                <input
                  type="text"
                  value={stack.stackName}
                  onChange={(e) => handleInputChange(index, 'stackName', e.target.value)}
                  className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-sm placeholder-gray-400 bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]"
                  placeholder={`Stack Name #${index + 1}`}
                />
              </div>
              {/* Station Type Input */}
              <div className="relative flex-1 flex items-center justify-center">
                <span className="absolute -top-3 left-6 bg-white px-2 text-sm font-semibold text-[#236a80] z-10">Station Type</span>
                <input
                  type="text"
                  value={stack.stationType}
                  onChange={(e) => handleInputChange(index, 'stationType', e.target.value)}
                  className="w-full border-2 border-dotted border-[#236a80] rounded-xl py-3 px-4 text-sm placeholder-gray-400 bg-gradient-to-r from-white to-[#f0f7fa] shadow-md focus:outline-none focus:ring-2 focus:ring-[#236a80]"
                  placeholder={`Station Type #${index + 1}`}
                />
              </div>
              {/* Remove Button - only shown if there is more than one input */}
              {stacks.length > 1 && (
                <div className="flex items-center justify-center md:ml-2">
                  <button
                    type="button"
                    onClick={() => handleRemoveInput(index)}
                    className="flex items-center justify-center bg-red-500 hover:bg-red-700 text-white rounded-full w-8 h-8 shadow-md transition border border-red-600"
                    title="Remove Stack"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Add More Button */}
        <div className="flex justify-center mb-6">
          <button
            type="button"
            onClick={handleAddInput}
            className="bg-[#236a80] text-white px-6 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-[#1d5566] transition border border-[#236a80] w-auto"
          >
            + Add Another Stack
          </button>
        </div>
        {/* Save and Cancel Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-green-700 transition border border-green-700 w-full sm:w-auto"
          >
            Save Stacks
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-red-600 text-white px-6 py-2 rounded-md text-sm font-semibold shadow-md hover:bg-red-700 transition border border-red-700 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStacks;