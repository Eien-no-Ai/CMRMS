import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";

function Profile() {
  const [userData, setUserData] = useState({});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const userId = localStorage.getItem("userId"); // Get the user ID from localStorage
  const [isSignatureModalOpen, setSignatureModalOpen] = useState(false);
  const [signatureFile, setSignatureFile] = useState(null); // Signature file state
  const [signatureUrl, setSignatureUrl] = useState(null); // Store the fetched signature URL
  const [selectedRecord, setSelectedRecord] = useState(null);
  // Fetch the user data when the component is mounted
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

  const handlePasswordUpdate = () => {
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setSuccessMessage("");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password should be at least 6 characters long");
      setSuccessMessage("");
      return;
    }

    axios
      .put(`http://localhost:3001/user/${userId}/update-password`, { password })
      .then((response) => {
        setSuccessMessage("Password updated successfully");
        setErrorMessage("");
        setPassword("");
        setConfirmPassword("");
      })
      .catch((error) => {
        setErrorMessage("Error updating password");
        setSuccessMessage("");
        console.error("Error updating password:", error);
      });
  };

 
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


  // Handle signature upload
  console.log("Selected Employee ID:", userId);
  // Handle signature upload
  const handleSignatureUpload = async (event) => {
    event.preventDefault();
    
    const formData = new FormData();
    formData.append('signature', signatureFile);

    try {
      const response = await axios.post(
        `http://localhost:3001/api/upload-signature/user/${userId}`,  // Ensure correct ID is passed
        formData, 
        {
          headers: {
            'Content-Type': 'multipart/form-data',  // Proper content type
          },
        }
      );

      if (response.data && response.data.signature) {
        console.log("Signature uploaded successfully:", response.data.signature);
        setSignatureUrl(response.data.signature); // Set the uploaded signature URL
        setSignatureModalOpen(false); // Close modal on success
      } else {
        console.error("Signature upload failed, no response data.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server responded with error:", error.response.data.message);
      } else {
        console.error("Error uploading signature:", error.message);
      }
    }
  };

  // Handle file input change
  const handleSignatureFileChange = (e) => {
    setSignatureFile(e.target.files[0]);
  };

  // // Fetch the signature URL when the component is mounted
  // useEffect(() => {
  //   if (userId) {
  //     fetchSignature(userId);
  //   }
  // }, [userId]);

  const fetchSignature = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/signature/user/${userId}`);
      
      if (response.data && response.data.signature) {
        setSignatureUrl(response.data.signature); // Set signature URL
      } else {
        console.error("No signature found.");
      }
    } catch (error) {
      console.error("Error fetching signature:", error);
    }
  };

  const handleSignatureModalClose = () => {
    setSignatureModalOpen(false);
  };

  useEffect(() => {
    if (errorMessage || successMessage) {
      const timer = setTimeout(() => {
        setErrorMessage("");
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

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
              <h3 className="text-2xl font-bold">
                {userData.firstname} {userData.lastname}
              </h3>
              <p className="text-gray-600">{userData.email}</p>
            </div>

            <br />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First name
                </label>
                <input
                  type="text"
                  value={userData.firstname || ""}
                  placeholder="First Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={userData.lastname || ""}
                  placeholder="Last Name"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={userData.email || ""}
                placeholder="Email"
                className="w-full p-2 border border-gray-300 rounded-lg"
                readOnly
              />
            </div>

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

            {errorMessage && (
              <p className="text-center mt-4 p-2 bg-red-100 border border-custom-red text-custom-red rounded">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p className="text-center mt-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
                {successMessage}
              </p>
            )}

            <div className="mt-6">
              <button
                onClick={handlePasswordUpdate}
                className="w-full bg-custom-red text-white px-4 py-2 rounded-lg"
              >
                Update Password
              </button>
            </div>

            {/* Upload Signature Button */}
            <div className="mt-6">
              <button
                onClick={() => setSignatureModalOpen(true)}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg"
              >
                Upload Signature
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSignatureModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white py-4 px-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-center">Upload Signature</h2>

            <form onSubmit={handleSignatureUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium">Select Signature Image</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleSignatureFileChange}
                  required
                  className="border rounded-lg w-full p-2 mt-1"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                  onClick={handleSignatureModalClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-custom-red text-white py-2 px-4 rounded-lg"
                >
                  Submit
                </button>

                <button
                type="button"
                className="bg-blue-500 text-white py-2 px-4 rounded-lg"
                onClick={() => fetchSignature(userId)} // Call fetchSignature with userId
              >
                Fetch Signature
              </button>

              </div>
            </form>

            {/* Display fetched signature image */}
            {signatureUrl && (
              <div className="mt-4 mb-4">
                <h3 className="text-sm font-medium mb-2">Current Signature:</h3>
                <img 
                  src={signatureUrl} // Use the URL fetched from the backend
                  alt="Signature"
                  className="border rounded-lg w-full h-auto mb-4"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;