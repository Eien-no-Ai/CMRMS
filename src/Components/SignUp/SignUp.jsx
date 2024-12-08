import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import cover_image from "../assets/cover.jpg";

function SignUp() {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const [signature, setSignature] = useState("");
  const [error, setError] = useState({
    firstname: "",
    lastname: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset errors before validating
    setError({
      firstname: "",
      lastname: "",
      password: "",
      confirmPassword: "",
    });

    let validationErrors = {
      firstname: "",
      lastname: "",
      password: "",
      confirmPassword: "",
    };

    // Validation for names (no numbers)
    const nameRegex = /^[A-Za-z]+$/;
    if (!nameRegex.test(firstname)) {
      validationErrors.firstname = "First name must only contain letters.";
    }
    if (!nameRegex.test(lastname)) {
      validationErrors.lastname = "Last name must only contain letters.";
    }

    // Password validation (8 characters, 1 uppercase, 1 special character)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      validationErrors.password = "Password must be at least 8 characters long and include one lowercase letter, one uppercase letter, and one special character.";
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      validationErrors.confirmPassword = "Passwords do not match.";
    }

    // If there are validation errors, set them in the state
    if (Object.values(validationErrors).some((error) => error !== "")) {
      setError(validationErrors);
    } else {
      // If validation passes, proceed with registration
      axios
        .post("https://cmrms-full.onrender.com/register", {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: password,
          signature: signature,
          confirmPassword: confirmPassword,
          department: department, // Add department to the post request
        })
        .then((result) => {
          console.log(result);
          navigate("/login");
        })
        .catch((err) => console.log(err));
    }
  };

  return (
    <div className="w-full h-screen flex flex-col md:flex-row items-start">
      <div className="w-full md:w-1/2 h-full bg-[#f5f5f5] flex flex-col p-8 md:p-20 justify-between">
        <div></div>
        <div className="w-full flex flex-col">
          <div className="w-full flex flex-col mb-2">
            <h3 className="text-2xl md:text-3xl font-semibold mb-2">Sign Up</h3>
            <p className="text-sm md:text-base mb-2">
              Please enter your details to create an account!
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="w-full flex flex-col">
              <div className="w-full">
                <input
                  type="text"
                  placeholder="First Name"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                {error.firstname && (
                  <p className="text-red-500 text-sm">{error.firstname}</p>
                )}
              </div>

              <div className="w-full">
                <input
                  type="text"
                  placeholder="Last Name"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
                {error.lastname && (
                  <p className="text-red-500 text-sm">{error.lastname}</p>
                )}
              </div>

              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="w-full">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="clinic">Clinic</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="xray">X-Ray</option>
                  <option value="pt">Physical Therapy</option>
                </select>
              </div>

              <div className="w-full">
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {error.password && (
                  <p className="text-red-500 text-sm">{error.password}</p>
                )}
              </div>

              <div className="w-full">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full text-black py-2 my-2 bg-transparent border-b border-black outline-none focus:outline-none"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {error.confirmPassword && (
                  <p className="text-red-500 text-sm">{error.confirmPassword}</p>
                )}
              </div>
            </div>
            <div className="w-full flex flex-col my-4">
              <button className="w-full text-white my-2 font-semibold bg-[#C3151C] rounded-md p-4 text-center flex items-center justify-center">
                Sign Up
              </button>
            </div>
          </form>
        </div>

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

export default SignUp;
