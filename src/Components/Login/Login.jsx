import React, { useState } from "react";
import cover_image from "../assets/cover.jpg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // To track OTP state
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [modalError, setModalError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // To store the success message
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // New state for success modal
  // Access environment variable for React URL
  const apiUrl = process.env.REACT_APP_REACT_URL;

  console.log(apiUrl); // This should log: https://cmrms-full.onrender.com
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await axios.post(`${apiUrl}/login`, {
        email,
        password,
      });
      if (result.data.message === "Login Successful") {
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("role", result.data.role);
        localStorage.setItem("userId", result.data.userId);
        if (result.data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      } else {
        setError(result.data.message);
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setOtpSent(false); // Reset OTP state when closing the modal
    setModalError("");
  };

  const handleSendOTP = async () => {
    try {
      const result = await axios.post("https://cmrms-full.onrender.com/forgot-password", { email });
      if (result.data.message === "OTP sent successfully") {
        setOtpSent(true); // Show OTP input after sending OTP
      } else {
        setModalError(result.data.error);
      }
    } catch (err) {
      console.error(err);
      setModalError("Failed to send OTP. Please try again.");
    }
  };

  // Handle password reset with OTP
  const handleResetPassword = async () => {
    try {
      const result = await axios.post("https://cmrms-full.onrender.com/verify-otp", {
        email,
        otp,
        newPassword,
      });
      console.log(result.data); // Log the response for debugging
      setIsSuccessModalOpen(true); // Open the success modal
      if (result.data.message === "Password updated successfully!") {
        setSuccessMessage("Password updated successfully!"); // Set the success message
        setOtpSent(false); // Reset OTP state after successful password reset
        setModalError(""); // Clear any previous error messages
        
      } else {
        setModalError(result.data.error);
      }
    } catch (err) {
      console.error(err);
      setModalError("Failed to reset password. Please try again.");
    }
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false); // Close the success modal
    toggleModal(); // Also close the main modal
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      {/* Existing login form */}
      <div className="relative w-full md:w-1/2 h-64 md:h-full flex flex-col">
        <div className="absolute top-[20%] left-[10%] flex flex-col">
          <h1 className="text-2xl md:text-4xl text-white font-bold my-2 md:my-4">
            University of Baguio
          </h1>
        </div>
        <img src={cover_image} alt="Cover" className="w-full h-full object-cover" />
      </div>

      <div className="w-full md:w-1/2 h-full bg-[#f5f5f5] flex flex-col p-8 md:p-20 justify-between">
        <div>
          <h1 className="text-lg md:text-xl text-[#060606] font-semibold">
            Centralized Medical Records
          </h1>
          <p>Management System</p>
        </div>

        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-2">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">Login</h3>
            <p className="text-sm md:text-base mb-2">
              Welcome! Please enter your details.
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <input
                type="email"
                placeholder="Email"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <p
              onClick={toggleModal}
              className="flex justify-end text-xs md:text-sm font-medium whitespace-nowrap cursor-pointer underline underline-offset-2"
            >
              Forgot Password?
            </p>

            <div className="w-full flex flex-col my-4">
              <button
                type="submit"
                className="w-full text-white my-2 font-semibold bg-[#C3151C] rounded-md p-4 text-center flex items-center justify-center"
              >
                Login
              </button>
            </div>
          </form>
        </div>

        <div className="w-full flex items-center justify-center">
          <p className="text-sm font-normal text-[#060606]">
            Don't have an account?{" "}
            <a
              href="/sign-up"
              className="font-semibold underline underline-offset-2 cursor-pointer text-[#C3151C]"
            >
              Sign up!
            </a>
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 transition-transform transform scale-95 hover:scale-100">
            <h2 className="text-lg font-semibold mb-4 text-left">Forgot Password?</h2>

            {successMessage ? (
              <p className="text-green-500 text-sm mt-2">{successMessage}</p> // Show success message
            ) : (
              <>
                {!otpSent ? (
                  <>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    {modalError && <p className="text-red-500 text-sm mt-2">{modalError}</p>}
                    <button
                      onClick={handleSendOTP}
                      className="px-6 py-2 mt-4 bg-[#C3151C] text-white font-semibold rounded-lg shadow-md hover:bg-[#A30E16] transition duration-200"
                    >
                      Send OTP
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Enter OTP"
                      className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                      onChange={(e) => setOtp(e.target.value)}
                    />
                    <input
                      type="password"
                      placeholder="New Password"
                      className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      onClick={handleResetPassword}
                      className="px-6 py-2 mt-4 bg-[#C3151C] text-white font-semibold rounded-lg shadow-md hover:bg-[#A30E16] transition duration-200"
                    >
                      Reset Password
                    </button>
                  </>
                )}
              </>
            )}

            <div className="mt-6 flex justify-center">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-gray-300 text-black font-semibold rounded-lg shadow-md hover:bg-gray-400 transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/3 transition-transform transform scale-95 hover:scale-100">
            <h2 className="text-lg font-semibold mb-4 text-left">Success!</h2>
            <p className="text-green-500 text-sm mt-2">{successMessage}</p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={closeSuccessModal}
                className="px-4 py-2 bg-[#C3151C] text-white font-semibold rounded-lg shadow-md hover:bg-[#A30E16] transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;