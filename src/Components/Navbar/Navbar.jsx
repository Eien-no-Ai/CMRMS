import { VscAccount } from "react-icons/vsc";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // Import axios for making API calls
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole] = useState(null);
  const [userData, setUserData] = useState({}); // State to store the user's data
  const userId = localStorage.getItem("userId"); // Get userId from localStorage
  const navigate = useNavigate(); // Initialize navigate
  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Logout function to clear localStorage and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem("role"); // Clear the role from localStorage
    localStorage.removeItem("userId"); // Clear the userId from localStorage
    navigate("/"); // Redirect to the login page
  };

  // Fetch the user data when the component is mounted
  useEffect(() => {
    if (userId) {
      axios
        .get(`http://localhost:3001/user/${userId}`)
        .then((response) => {
          setUserData(response.data); // Set the fetched user data
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  useEffect(() => {
    // Retrieve the role from localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      setRole(storedRole);
    }
  }, []);

  // Handle click outside of the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false); // Close dropdown if clicked outside
      }
    };

    // Add event listener to detect clicks outside the dropdown
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener when the component is unmounted
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
        {role !== "admin" && role !== "user" && (
          <>
            <a href="/home" className="hover:underline">
              Home
            </a>
          </>
        )}
        {role === "user" && (
          <a href="/home" className="hover:underline">
            Home
          </a>
        )}
        {role === "admin" && (
          <a href="/admin" className="hover:underline">
            Home
          </a>
        )}
        {role === "nurse" && (
          <>
            <a href="/patients" className="hover:underline">
              Patients
            </a>
            <a href="/packages" className="hover:underline">
              Packages
            </a>
            <a href="/vaccines" className="hover:underline">
              Vaccines
            </a>
          </>
        )}
        {role === "doctor" && (
          <>
            <a href="/patients" className="hover:underline">
              Patients
            </a>
            <a href="/admin" className="hover:underline">
              Manage Accounts
            </a>
          </>
        )}
        {role === "senior medtech" && role === "senior medtech" &&(
          <>
            <a href="/laboratory/census" className="hover:underline">
              Census
            </a>
          </>
        )}

        <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className="flex items-center cursor-pointer text-white hover:text-gray-300"
        >
          <VscAccount size={24} />
          <span className="ml-2">
            {userData.firstname ? `${userData.firstname}` : "Hello, User"}
          </span>
        </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg py-2 z-10">
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
