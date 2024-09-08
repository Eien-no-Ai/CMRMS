import React from "react";
import cover_image from "../assets/cover.jpg";

function Login() {
  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      
      <div className="relative w-full md:w-1/2 h-64 md:h-full flex flex-col">
        <div className="absolute top-[20%] left-[10%] flex flex-col">
          <h1 className="text-2xl md:text-4xl text-white font-bold my-2 md:my-4">
            University of Baguio
          </h1>
        </div>
        <img
          src={cover_image}
          alt="Clinic"
          className="w-full h-full object-cover"
        />
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

          <div className="w-full flex flex-col">
            <input
              type="email"
              placeholder="Email"
              className="w-full text-custom-red py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
            <input
              type="password"
              placeholder="Password"
              className="w-full text-custom-red py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
              />
          </div>

          <p className="flex justify-end text-xs md:text-sm font-medium whitespace-nowrap cursor-pointer underline underline-offset-2">
            Forgot Password?
          </p>
          <div className="w-full flex flex-col my-4">
          <button className="w-full text-white my-2 font-semibold bg-[#C3151C] rounded-md p-4 text-center flex items-center justify-center">
            Login
          </button>
        </div>
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
    </div>
  );
}

export default Login;
