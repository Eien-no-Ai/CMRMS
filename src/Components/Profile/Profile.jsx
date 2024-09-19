import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar/Navbar';

function Profile() {
  const [userData, setUserData] = useState({});
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const userId = localStorage.getItem('userId'); // Get the user ID from localStorage

  // Fetch the user data when the component is mounted
  useEffect(() => {
    if (userId) {
      axios.get(`http://localhost:3001/user/${userId}`)
        .then(response => {
          setUserData(response.data);
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
        });
    }
  }, [userId]);

  const handlePasswordUpdate = () => {
    // Basic validation
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setSuccessMessage('');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password should be at least 6 characters long');
      setSuccessMessage('');
      return;
    }

    // Send update password request to the backend
    axios.put(`http://localhost:3001/user/${userId}/update-password`, { password })
      .then(response => {
        setSuccessMessage('Password updated successfully');
        setErrorMessage('');
        setPassword('');
        setConfirmPassword('');
      })
      .catch(error => {
        setErrorMessage('Error updating password');
        setSuccessMessage('');
        console.error('Error updating password:', error);
      });
  };

  // Clear messages after 3 seconds
  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
        setSuccessMessage('');
      }, 3000);

      return () => clearTimeout(timer); // Cleanup timer if component unmounts
    }
  }, [errorMessage, successMessage]);

  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-6 pt-20">
        <div className="max-w-full">
          <div className="text-3xl font-semibold mb-4">Account Settings</div>

          <div className="bg-white p-6 rounded-lg shadow-lg relative">
            {/* User's cover photo */}
            <div className="relative mb-12 w-full">
              <img
                src="https://via.placeholder.com/1500x400"
                alt="Store Banner"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute left-6 bottom-[-50px] w-36 h-36 rounded-full overflow-hidden border-4 border-white bg-gray-200">
                <img
                  src="https://via.placeholder.com/150"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* User's basic information */}
            <div className="ml-6 mt-12">
              <h3 className="text-2xl font-bold">
                {userData.firstname} {userData.lastname}
              </h3>
              <p className="text-gray-600">{userData.email}</p>
            </div>

            <br />

            {/* Form for updating user information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={userData.firstname || ''}
                  placeholder="First Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>


              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData.lastname || ''}
                  placeholder="Last Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>

              
            </div>

            {/* Email */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userData.email || ''}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-lg"
                readOnly
              />
            </div>

            {/* Password Update Fields */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Error and Success Messages */}
            {errorMessage && (
              <p className="text-center mt-4 p-2 bg-red-100 border border-custom-red text-custom-red rounded">{errorMessage}</p>
            )}
            {successMessage && (
              <p className="text-center mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">{successMessage}</p>
            )}

            {/* Update Button */}
            <div className="mt-6">
              <button
                onClick={handlePasswordUpdate}
                className="w-full bg-custom-red text-white px-4 py-2 rounded-lg"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
