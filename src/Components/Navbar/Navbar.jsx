import { VscAccount } from "react-icons/vsc";
import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";  // Import useNavigate for redirection

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);
  const navigate = useNavigate(); // Initialize navigate

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Logout function to clear localStorage and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem('role');  // Clear the role from localStorage
    navigate('/');  // Redirect to the login page
  };

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem('role');
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-700 text-white p-3 flex items-center justify-between z-50">
      <div className="flex items-center">
        <span className="mr-8 ml-8 text-xl">CMRMS</span>
      </div>
      <div className="flex items-center space-x-20 mr-8">
        {/* Conditionally render links based on role */}
        {role !== 'admin' && (
          <>
            <a href="/home" className="hover:underline">Home</a>
            <a href="/patients" className="hover:underline">Patients</a>
            <a href="/patients-profile" className="hover:underline">test</a>
          </>
        )}

        <div className="relative">
          <button onClick={toggleDropdown} className="flex items-center cursor-pointer">
            <VscAccount size={24} />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
              <a href="/profile" className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</a>
              {/* Logout link with onClick handler */}
              <button 
                onClick={handleLogout} 
                className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
