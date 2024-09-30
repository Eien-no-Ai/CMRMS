import React, { useState } from "react";
import cover_image from "../assets/cover.jpg";
import axios from "axios"; 
import { useNavigate } from "react-router-dom";

function AdminSignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:3001/register", {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        password: formData.password,
        role: "admin",
      });
      alert("Registration Successful");
      navigate("/login");
    } catch (error) {
      console.error("Error registering admin:", error);
      alert("Registration Failed");
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      <div className="w-full md:w-1/2 h-full bg-[#f5f5f5] flex flex-col p-8 md:p-20 justify-between">
        <div>
          <h1 className="text-lg md:text-xl text-[#060606] font-semibold">
            University of Baguio
          </h1>
          <p>Administrator</p>
        </div>
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-2">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">Sign Up</h3>
            <p className="text-sm md:text-base mb-2">
              Please enter your details to create an admin account!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col">
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
            />
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
            />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
            />
            <div className="w-full flex flex-col my-4">
              <button
                type="submit"
                className="w-full text-white my-2 font-semibold bg-[#C3151C] rounded-md p-4 text-center flex items-center justify-center"
              >
                Sign Up
              </button>
            </div>
          </form>

          <div className="w-full flex items-center justify-center">
            <p className="text-sm font-normal text-[#060606]">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold underline underline-offset-2 cursor-pointer text-[#C3151C]"
              >
                Login!
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full md:w-1/2 h-64 md:h-full flex flex-col">
        <div className="absolute top-[20%] left-[10%] md:left-[10%] flex flex-col">
          <h1 className="text-2xl md:text-4xl text-white font-bold my-2 md:my-4">
            Centralized Medical Records
          </h1>
          <p className="text-lg md:text-xl text-white font-normal">
            Management System
          </p>
        </div>
        <img
          src={cover_image}
          alt="Clinic"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

export default AdminSignUp;
