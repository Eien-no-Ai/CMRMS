import { VscAccount } from "react-icons/vsc";
import React, { useState } from 'react';

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-700 text-white p-3 flex items-center justify-between z-50">
      <div className="flex items-center">
        <span className="mr-8 ml-8 text-xl">CMRMS</span>
      </div>
      <div className="flex items-center space-x-20 mr-8">
        <a href="/home" className="hover:underline">Home</a>
        <a href="/patients" className="hover:underline">Patients</a>
        <a href="/patients-profile" className="hover:underline">test</a>

        <div className="relative">
          <span onClick={toggleDropdown} className="flex items-center cursor-pointer">
            <VscAccount size={24} />
          </span>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
              <a href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
              <a href="/logout" className="block px-4 py-2 text-sm hover:bg-gray-100">Logout</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
