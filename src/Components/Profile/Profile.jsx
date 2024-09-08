import React from "react";
import Navbar from "../Navbar/Navbar";

function Profile() {
  return (
    <div>
      <Navbar />
      <div className="bg-gray-100 min-h-screen p-6 pt-20">
        <div className="max-w-full">
          <div className="text-3xl font-semibold mb-4">Account Settings</div>

          <div className="bg-white p-6 rounded-lg shadow-lg relative">
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

            <div className="ml-6 mt-12">
              {" "}
              <h3 className="text-2xl font-bold">User</h3>
              <p className="text-gray-600">20214098@s.ubaguio.edu</p>
            </div>

            <br />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  placeholder="Middle Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
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
                placeholder="20214098@s.ubaguio.edu.com"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Password */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="********"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            {/* Update Button */}
            <div className="mt-6">
              <button className="w-full bg-custom-red text-white px-4 py-2 rounded-lg">
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
