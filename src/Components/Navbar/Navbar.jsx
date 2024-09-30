import { VscAccount } from "react-icons/vsc";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; 
import { useNavigate } from "react-router-dom"; 

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState({}); 
  const userId = localStorage.getItem("userId"); 
  const navigate = useNavigate(); 
  const dropdownRef = useRef(null); 

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("role"); 
    localStorage.removeItem("userId"); 
    navigate("/");
  };

  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3001/user/${userId}`)
        .then((response) => {
          setUserData(response.data); 
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); 
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-700 text-white p-3 flex items-center justify-between z-50">
      <div className="flex items-center">
        <span className="mr-8 ml-8 text-xl">CMRMS</span>
      </div>
      <div className="flex items-center space-x-20 mr-8">
        {role !== "admin" && (
          <a href="/home" className="hover:underline">
            Home
          </a>
        )}

        {role !== "admin" && role !== "user" && role !== "laboratory staff" && (
          <a href="/patients" className="hover:underline">
            Patients
          </a>
        )}

        {role === "admin" && (
          <a href="/admin" className="hover:underline">
            Home
          </a>
        )}

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center cursor-pointer"
          >
            <VscAccount size={24} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
              <div className="px-4 py-2 text-sm text-gray-800 border-b">
                {userData.firstname
                  ? `Hello, ${userData.firstname}`
                  : "Hello, User"}
              </div>
              <a
                href="/profile"
                className="block px-4 py-2 text-sm hover:bg-gray-100"
              >
                Profile
              </a>
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
